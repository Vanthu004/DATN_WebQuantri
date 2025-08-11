// src/controllers/productController.js
const Product = require("../models/product");
const Category = require("../models/category");
const CategoryType = require("../models/categoryType");
const mongoose = require('mongoose');
const ProductVariant = require('../models/productVariant');

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
  const session = await mongoose.startSession();
  session.startTransaction();
  
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
    const { images, image_url, variants, ...rest } = req.body;
    
    // Tính toán giá min/max và các thuộc tính khác
    let minPrice = rest.price || 0;
    let maxPrice = rest.price || 0;
    let hasVariants = false;
    let availableSizes = [];
    let availableColors = [];
    
    if (Array.isArray(variants) && variants.length > 0) {
      hasVariants = true;
      const prices = variants.map(v => v.price).filter(p => p > 0);
      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }
      
      // Lấy danh sách size và color duy nhất
      availableSizes = [...new Set(variants.map(v => v.attributes?.size).filter(Boolean))];
      availableColors = [...new Set(variants.map(v => v.attributes?.color).filter(Boolean))];
    }
    
    const product = await Product.create([{
      ...rest,
      product_id,
      images: images || [],
      image_url: image_url || "",
      has_variants: hasVariants,
      min_price: minPrice,
      max_price: maxPrice,
      total_variants: variants?.length || 0,
      available_sizes: availableSizes,
      available_colors: availableColors
    }], { session });
    
    const createdProduct = product[0];
    
    // Nếu có biến thể, tạo luôn các biến thể với product_id là _id sản phẩm vừa tạo
    let insertedVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const variantPayload = variants.map((v, index) => ({
        ...v,
        product_id: createdProduct._id,
        sort_order: index
      }));
      insertedVariants = await ProductVariant.insertMany(variantPayload, { 
        session, 
        ordered: false 
      });
    }
    
    await session.commitTransaction();
    
    // Populate và trả về kết quả
    const populated = await Product.findById(createdProduct._id)
      .populate([
        "category_id",
        "images",
        "available_sizes",
        "available_colors"
      ])
      .lean();
      
    // Populate variants nếu có
    if (insertedVariants.length > 0) {
      const populatedVariants = await ProductVariant.find({
        _id: { $in: insertedVariants.map(v => v._id) }
      })
      .populate('attributes.size')
      .populate('attributes.color')
      .lean();
      
      return res.status(201).json({ 
        ...populated, 
        variants: populatedVariants 
      });
    }
    
    res.status(201).json({ ...populated, variants: [] });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

/* Lấy tất cả sản phẩm (chỉ lấy chưa bị xóa) */
exports.getAllProducts = async (req, res) => {
  const filter = req.query.showDeleted === "true" ? {} : { is_deleted: false };
  const includeVariants = req.query.includeVariants === "true";
  
  try {
    const list = await Product.find(filter)
      .populate('category_id', 'name image_url')
      .populate('images')
      .populate('available_sizes', 'name')
      .populate('available_colors', 'name')
      .lean();

    // Nếu cần lấy variants, sử dụng aggregation để tối ưu
    if (includeVariants) {
      const productsWithVariants = await Promise.all(
        list.map(async (product) => {
          const variants = await ProductVariant.find({ 
            product_id: product._id,
            is_active: true 
          })
          .populate('attributes.size', 'name')
          .populate('attributes.color', 'name')
          .sort({ sort_order: 1 })
          .lean();
          
          return {
            ...product,
            variants
          };
        })
      );
      
      // Xử lý reviews nếu cần
      const includeReviews = req.query.includeReviews === "true";
      if (includeReviews) {
        const Review = require('../models/review');
        const productsWithReviews = await Promise.all(
          productsWithVariants.map(async (product) => {
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

      // Trả về danh sách sản phẩm với biến thể
      const result = productsWithVariants.map(product => ({
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

      return res.json(result);
    }

    // Nếu không cần variants, trả về trực tiếp
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
    const includeVariants = req.query.includeVariants === "true";
    
    const product = await Product.findById(req.params.id)
      .populate('category_id', 'name image_url')
      .populate('images')
      .populate('available_sizes', 'name')
      .populate('available_colors', 'name')
      .lean();

    if (!product || product.is_deleted) {
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    }

    // Lấy variants nếu cần
    let variants = [];
    if (includeVariants) {
      variants = await ProductVariant.find({ 
        product_id: product._id,
        is_active: true 
      })
      .populate('attributes.size', 'name')
      .populate('attributes.color', 'name')
      .sort({ sort_order: 1 })
      .lean();
    }

    // Gom nhóm variants theo color
    let colorGroups = [];
    if (variants.length > 0) {
      const groupedVariants = {};
      variants.forEach(variant => {
        const color = variant.attributes.color;
        const colorId = color._id.toString();
        if (!groupedVariants[colorId]) {
          groupedVariants[colorId] = {
            color: color,
            sizes: []
          };
        }
        groupedVariants[colorId].sizes.push({
          size: variant.attributes.size,
          variant_id: variant._id,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          sku: variant.sku,
          image_url: variant.image_url
        });
      });
      colorGroups = Object.values(groupedVariants);
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
      colorGroups, // <-- Trả về nhóm màu, mỗi nhóm chứa các size
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

/* Lấy sản phẩm với thông tin tối ưu cho Frontend */
exports.getProductForFrontend = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sử dụng aggregation để lấy tất cả thông tin trong 1 query
    const result = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), is_deleted: false } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'product_id',
          as: 'variants'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'product_id',
          as: 'reviews'
        }
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'images',
          foreignField: '_id',
          as: 'product_images'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$category', 0] },
          main_image: {
            $cond: {
              if: { $ne: ['$image_url', ''] },
              then: '$image_url',
              else: { $arrayElemAt: ['$product_images.url', 0] }
            }
          },
          total_stock: {
            $add: [
              '$stock_quantity',
              { $sum: '$variants.stock_quantity' }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          product_id: 1,
          name: 1,
          price: 1,
          description: 1,
          stock_quantity: 1,
          status: 1,
          category: 1,
          images: '$product_images',
          image_url: 1,
          main_image: 1,
          sold_quantity: 1,
          views: 1,
          has_variants: 1,
          min_price: 1,
          max_price: 1,
          total_variants: 1,
          available_sizes: 1,
          available_colors: 1,
          total_stock: 1,
          variants: 1,
          reviews: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    }

    const product = result[0];

    // Tính rating
    let rating = 0;
    let ratingCount = 0;
    if (product.reviews && product.reviews.length > 0) {
      const validReviews = product.reviews.filter(r => r.rating >= 1 && r.rating <= 5);
      if (validReviews.length > 0) {
        const totalRating = validReviews.reduce((sum, r) => sum + r.rating, 0);
        rating = (totalRating / validReviews.length).toFixed(1);
        ratingCount = validReviews.length;
      }
    }

    // Format kết quả
    const formattedProduct = {
      ...product,
      rating: parseFloat(rating),
      ratingCount,
      stock: product.stock_quantity,
      category: product.category ? {
        _id: product.category._id,
        name: product.category.name,
        image_url: product.category.image_url
      } : null
    };

    res.json(formattedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* Cập nhật sản phẩm */
exports.updateProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { images, image_url, variants, ...rest } = req.body;
    const productId = req.params.id;

    // Kiểm tra sản phẩm có tồn tại không
    const existingProduct = await Product.findById(productId);
    if (!existingProduct || existingProduct.is_deleted) {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    }

    // Cập nhật thông tin cơ bản của sản phẩm
    const updated = await Product.findByIdAndUpdate(
      productId,
      {
        ...rest,
        images: images || [],
        image_url: image_url || "",
      },
      { new: true, session }
    ).populate(["category_id", "images"]);

    // Nếu có cập nhật variants, xử lý đồng bộ
    if (variants !== undefined) {
      // Import ProductVariant nếu cần
      const ProductVariant = require('../models/productVariant');
      
      // Helper function để cập nhật thông tin product từ variants
      async function updateProductFromVariants(productId) {
        try {
          const variants = await ProductVariant.find({ 
            product_id: productId,
            is_active: true 
          }).populate('attributes.size').populate('attributes.color');

          const hasVariants = variants.length > 0;
          const prices = variants.map(v => v.price).filter(p => p > 0);
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
          
          // Lấy danh sách size và color duy nhất
          const availableSizes = [...new Set(variants.map(v => v.attributes.size._id).filter(Boolean))];
          const availableColors = [...new Set(variants.map(v => v.attributes.color._id).filter(Boolean))];

          await Product.findByIdAndUpdate(productId, {
            has_variants: hasVariants,
            min_price: minPrice,
            max_price: maxPrice,
            total_variants: variants.length,
            available_sizes: availableSizes,
            available_colors: availableColors
          }, { session });
        } catch (error) {
          console.error('Error updating product from variants:', error);
        }
      }

      // Cập nhật thông tin product từ variants hiện tại
      await updateProductFromVariants(productId);
    }

    await session.commitTransaction();
    res.json(updated);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
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
// Giảm tồn kho cho 1 hoặc nhiều sản phẩm
exports.decreaseProductStock = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }, ...]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock_quantity: -item.quantity } }
      }
    }));

    await Product.bulkWrite(bulkOps);

    res.json({ message: "Cập nhật tồn kho thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Hoàn tồn kho cho 1 hoặc nhiều sản phẩm
exports.increaseProductStock = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }, ...]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock_quantity: +item.quantity } }
      }
    }));

    await Product.bulkWrite(bulkOps);

    res.json({ message: "Cập nhật tồn kho thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};