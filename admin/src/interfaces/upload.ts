export default interface Upload {
  _id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy?: string;
  relatedTo?: {
    model: string;
    id: string;
  };
  createdAt: string;
}
