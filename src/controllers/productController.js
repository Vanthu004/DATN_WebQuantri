// src/controllers/productController.js
const Product = require("../models/product");
const Category = require("../models/category");
const CategoryType = require("../models/categoryType");
const mongoose = require('mongoose');

// Escape regex function
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.searchProducts = async (req, res) => {
  try {
    let { keyword = '', page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (!keyword.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    const regex = new RegExp(escapeRegex(keyword), "i");
    const filter = { name: { $regex: regex }, is_deleted: false };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      limit,
      products
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm" });
  }
};

/* Tạo sản phẩm mới */
exports.createProduct = async (req, res) => {
  try {
    // Tìm product_id lớn nhất hiện tại
    const lastProduct = await Product.findOne({}).sort({ product_id: -1 });
    let nextId = 1;
    if (lastProduct && lastProduct.product_id) {
      const match = lastProduct.product_id.match(/P(\d{3})/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    const product_id = `P${nextId.toString().padStart(3, "0")}`;
    // Lưu ý: images là mảng ObjectId Upload, image_url là url cũ
    const { images, image_url, ...rest } = req.body;
    const product = await Product.create({
      ...rest,
      product_id,
      images: images || [],
      image_url: image_url || "",
    });
    const populated = await Product.findById(product._id).populate([
      "category_id",
      "images",
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Lấy tất cả sản phẩm (chỉ lấy chưa bị xóa) */
exports.getAllProducts = async (req, res) => {
  const filter = req.query.showDeleted === "true" ? {} : { is_deleted: false };
  try {
    const list = await Product.find(filter)
      .populate('category_id', 'name image_url')
      .populate('images')
      .lean();

    // Nếu cần thêm reviews và rating cho từng sản phẩm
    const includeReviews = req.query.includeReviews === "true";
    
    if (includeReviews) {
      const Review = require('../models/review');
      const productsWithReviews = await Promise.all(
        list.map(async (product) => {
          const reviews = await Review.find({ product_id: product._id })
            .populate('user_id', 'name email avatar')
            .lean();

          let rating = 0;
          let totalRating = 0;
          let ratingCount = 0;

          if (reviews.length > 0) {
            reviews.forEach(review => {
              if (review.rating && review.rating >= 1 && review.rating <= 5) {
                totalRating += review.rating;
                ratingCount++;
              }
            });
            rating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
          }

          return {
            ...product,
            reviews: reviews,
            rating: parseFloat(rating),
            ratingCount: ratingCount,
            stock: product.stock_quantity,
            images: product.images || [],
            image_url: product.image_url || "",
            category: product.category_id ? {
              _id: product.category_id._id,
              name: product.category_id.name,
              image_url: product.category_id.image_url
            } : null
          };
        })
      );
      return res.json(productsWithReviews);
    }

    // Trả về danh sách sản phẩm với thông tin cơ bản
    const result = list.map(product => ({
      ...product,
      stock: product.stock_quantity,
      images: product.images || [],
      image_url: product.image_url || "",
      category: product.category_id ? {
        _id: product.category_id._id,
        name: product.category_id.name,
        image_url: product.category_id.image_url
      } : null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy sản phẩm theo ID */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id', 'name image_url')
      .populate('images')
      .lean();

    if (!product || product.is_deleted) {
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    }

    // Lấy reviews nếu có
    const Review = require('../models/review');
    const reviews = await Review.find({ product_id: product._id })
      .populate('user_id', 'name email avatar')
      .lean();

    // Tính rating trung bình
    let rating = 0;
    let totalRating = 0;
    let ratingCount = 0;

    if (reviews.length > 0) {
      reviews.forEach(review => {
        if (review.rating && review.rating >= 1 && review.rating <= 5) {
          totalRating += review.rating;
          ratingCount++;
        }
      });
      rating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
    }

    // Đảm bảo các trường cần thiết
    const result = {
      ...product,
      reviews: reviews,
      rating: parseFloat(rating),
      ratingCount: ratingCount,
      stock: product.stock_quantity, // Thêm trường stock cho FE
      images: product.images || [],
      image_url: product.image_url || "",
      category: product.category_id ? {
        _id: product.category_id._id,
        name: product.category_id.name,
        image_url: product.category_id.image_url
      } : null
    };

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ msg: 'Lỗi server', error: err.message });
  }
};

/* Lấy sản phẩm theo danh mục (chỉ lấy chưa bị xóa) */
exports.getProductsByCategory = async (req, res) => {
  try {
    const list = await Product.find({
      category_id: req.params.categoryId,
      is_deleted: false,
    })
      .populate('category_id', 'name image_url')
      .populate('images')
      .lean();

    // Nếu cần thêm reviews và rating cho từng sản phẩm
    const includeReviews = req.query.includeReviews === "true";
    
    if (includeReviews) {
      const Review = require('../models/review');
      const productsWithReviews = await Promise.all(
        list.map(async (product) => {
          const reviews = await Review.find({ product_id: product._id })
            .populate('user_id', 'name email avatar')
            .lean();

          let rating = 0;
          let totalRating = 0;
          let ratingCount = 0;

          if (reviews.length > 0) {
            reviews.forEach(review => {
              if (review.rating && review.rating >= 1 && review.rating <= 5) {
                totalRating += review.rating;
                ratingCount++;
              }
            });
            rating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
          }

          return {
            ...product,
            reviews: reviews,
            rating: parseFloat(rating),
            ratingCount: ratingCount,
            stock: product.stock_quantity,
            images: product.images || [],
            image_url: product.image_url || "",
            category: product.category_id ? {
              _id: product.category_id._id,
              name: product.category_id.name,
              image_url: product.category_id.image_url
            } : null
          };
        })
      );
      return res.json(productsWithReviews);
    }

    // Trả về danh sách sản phẩm với thông tin cơ bản
    const result = list.map(product => ({
      ...product,
      stock: product.stock_quantity,
      images: product.images || [],
      image_url: product.image_url || "",
      category: product.category_id ? {
        _id: product.category_id._id,
        name: product.category_id.name,
        image_url: product.category_id.image_url
      } : null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Lấy sản phẩm theo loại danh mục */
exports.getProductsByCategoryType = async (req, res) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Nếu type không phải ObjectId hợp lệ thì trả về mảng rỗng
    if (!mongoose.Types.ObjectId.isValid(type)) {
      return res.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: 'Loại danh mục không hợp lệ'
      });
    }

    const matchStage = {
      'category.categoryType': new mongoose.Types.ObjectId(type),
      'category.is_deleted': false,
      is_deleted: false,
      status: 'active'
    };

    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $match: matchStage },
      { $sort: { created_date: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          image_url: 1,
          sold_quantity: 1,
          views: 1,
          created_date: 1,
          category_id: '$category._id',
          category_name: '$category.name',
          category_type: '$category.categoryType'
        }
      }
    ]);

    // Đếm tổng số sản phẩm để phân trang
    const totalProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $match: matchStage },
      { $count: 'total' }
    ]);

    const total = totalProducts.length > 0 ? totalProducts[0].total : 0;

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: `Lấy danh sách sản phẩm theo loại danh mục ${type} thành công`
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy sản phẩm theo loại danh mục' });
  }
};

/* Cập nhật sản phẩm */
exports.updateProduct = async (req, res) => {
  try {
    const { images, image_url, ...rest } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        images: images || [],
        image_url: image_url || "",
      },
      { new: true }
    ).populate(["category_id", "images"]);
    if (!updated || updated.is_deleted)
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* Xoá mềm sản phẩm - thay đổi status thành inactive */
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        is_deleted: true,
        status: "inactive"
      },
      { new: true }
    );
    if (!deleted)
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json({ msg: "Đã xoá sản phẩm và chuyển status thành inactive", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Khôi phục sản phẩm đã xóa */
exports.restoreProduct = async (req, res) => {
  try {
    const restored = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        is_deleted: false,
        status: "active"
      },
      { new: true }
    );
    if (!restored)
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    res.json({ msg: "Đã khôi phục sản phẩm và chuyển status thành active", restored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 🔥 Bán chạy nhất (Best Sellers) */
exports.getBestSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bestSellers = await Product.find({ 
      status: 'active',
      is_deleted: false 
    })
      .sort({ sold_quantity: -1 })
      .limit(limit)
      .select("name price image_url sold_quantity category_id")
      .populate("category_id", "name");
    
    res.json({
      success: true,
      data: bestSellers,
      message: "Lấy danh sách sản phẩm bán chạy thành công"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi lấy danh sách sản phẩm bán chạy"
    });
  }
};

/* 🆕 Mới nhất (Newest Products) */
exports.getNewestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const newestProducts = await Product.find({ 
      status: 'active',
      is_deleted: false 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name price image_url createdAt category_id")
      .populate("category_id", "name");
    
    res.json({
      success: true,
      data: newestProducts,
      message: "Lấy danh sách sản phẩm mới nhất thành công"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi lấy danh sách sản phẩm mới nhất"
    });
  }
};

/* ⭐ Phổ biến nhất (Most Popular) */
exports.getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Sử dụng aggregation để tính popularity_score
    const popularProducts = await Product.aggregate([
      {
        $addFields: {
          popularity_score: {
            $add: [
              { $multiply: ['$sold_quantity', 3] }, // Trọng số cao hơn cho số lượng bán
              { $multiply: ['$views', 1] }, // Trọng số thấp hơn cho lượt xem
            ]
          }
        }
      },
      { $match: { status: 'active', is_deleted: false } },
      { $sort: { popularity_score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          name: 1,
          price: 1,
          image_url: 1,
          sold_quantity: 1,
          views: 1,
          popularity_score: 1,
          'category_id': '$category._id',
          'category_name': '$category.name'
        }
      }
    ]);
    
    res.json({
      success: true,
      data: popularProducts,
      message: "Lấy danh sách sản phẩm phổ biến thành công"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi lấy danh sách sản phẩm phổ biến"
    });
  }
};

/* Lấy thông tin reviews và rating của sản phẩm */
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId).lean();
    if (!product || product.is_deleted) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy sản phẩm" 
      });
    }

    // Lấy reviews
    const Review = require('../models/review');
    const reviews = await Review.find({ product_id: productId })
      .populate('user_id', 'name email avatar')
      .sort({ create_date: -1 })
      .lean();

    // Tính rating trung bình và thống kê
    let totalRating = 0;
    let ratingCount = 0;
    const ratingStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(review => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) {
        totalRating += review.rating;
        ratingCount++;
        ratingStats[review.rating]++;
      }
    });

    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

    // Tính phần trăm cho từng rating
    const ratingPercentages = {};
    Object.keys(ratingStats).forEach(rating => {
      ratingPercentages[rating] = ratingCount > 0 ? ((ratingStats[rating] / ratingCount) * 100).toFixed(1) : 0;
    });

    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          image_url: product.image_url
        },
        reviews: reviews,
        rating: {
          average: parseFloat(averageRating),
          total: ratingCount,
          stats: ratingStats,
          percentages: ratingPercentages
        }
      },
      message: "Lấy thông tin đánh giá sản phẩm thành công"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi lấy thông tin đánh giá sản phẩm"
    });
  }
};

/* Tăng lượt xem sản phẩm */
exports.incrementViews = async (req, res) => {
  try {
    const productId = req.params.id;
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: "Không tìm thấy sản phẩm" 
      });
    }
    
    res.json({
      success: true,
      data: { views: updated.views },
      message: "Đã tăng lượt xem sản phẩm"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi tăng lượt xem sản phẩm"
    });
  }
};

/* 🏠 Dữ liệu tổng hợp cho màn hình Home */
exports.getHomeData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Lấy sản phẩm bán chạy nhất
    const bestSellers = await Product.find({ 
      status: 'active',
      is_deleted: false 
    })
      .sort({ sold_quantity: -1 })
      .limit(limit)
      .select("name price image_url sold_quantity category_id")
      .populate("category_id", "name");
    
    // Lấy sản phẩm mới nhất
    const newestProducts = await Product.find({ 
      status: 'active',
      is_deleted: false 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name price image_url createdAt category_id")
      .populate("category_id", "name");
    
    // Lấy sản phẩm phổ biến nhất
    const popularProducts = await Product.aggregate([
      {
        $addFields: {
          popularity_score: {
            $add: [
              { $multiply: ['$sold_quantity', 3] },
              { $multiply: ['$views', 1] },
            ]
          }
        }
      },
      { $match: { status: 'active', is_deleted: false } },
      { $sort: { popularity_score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          name: 1,
          price: 1,
          image_url: 1,
          sold_quantity: 1,
          views: 1,
          popularity_score: 1,
          'category_id': '$category._id',
          'category_name': '$category.name'
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        bestSellers: {
          title: "🔥 Bán chạy nhất",
          products: bestSellers
        },
        newestProducts: {
          title: "🆕 Mới nhất",
          products: newestProducts
        },
        popularProducts: {
          title: "⭐ Phổ biến nhất",
          products: popularProducts
        }
      },
      message: "Lấy dữ liệu màn hình home thành công"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message,
      message: "Lỗi khi lấy dữ liệu màn hình home"
    });
  }
};
