import GenericTable, { type ColumnConfig, type FieldConfig } from "./GenericTable";

const Product: React.FC = () => {
  const fields: FieldConfig[] = [
    { name: "id", label: "Product ID", type: "number", placeholder: "Auto-filled when editing" },
    { name: "name", label: "Product Name", type: "text", required: true },
    { name: "sku", label: "SKU", type: "text", required: true },
    { name: "price", label: "Price", type: "number", step: "0.01", required: true },
    { name: "currency", label: "Currency", type: "text", placeholder: "USD" },
    { name: "category_code", label: "Category Code", type: "text", required: true },
    { name: "inStock", label: "In Stock", type: "select", options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ]},
    { name: "rating", label: "Rating", type: "number", step: "0.1", min: "0", max: "5" },
    { name: "reviews", label: "Reviews", type: "number", min: "0" },
    { name: "imagePath", label: "Image Path", type: "text", placeholder: "/images/product.jpg" },
  ];

  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Image", key: "imagePath", render: (value) => (value ? <img src={value} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} /> : "-") },
    { header: "Name", key: "name" },
    { header: "SKU", key: "sku" },
    { header: "Price", key: "price", render: (value, row) => `${value} ${row.currency ?? ""}` },
    { header: "Category Code", key: "category_code" },
    { header: "In Stock", key: "inStock", render: (value) => (value ? "Yes" : "No") },
    { header: "Rating", key: "rating" },
    { header: "Reviews", key: "reviews" },
  ];

  const transformResponse = (data: unknown): Record<string, any>[] => {
    if (Array.isArray(data)) {
      return data as Record<string, any>[];
    }

    if (typeof data !== "object" || data === null) {
      return [];
    }

    return Object.values(data as Record<string, unknown>).flatMap((value) => {
      if (Array.isArray(value)) {
        return value as Record<string, any>[];
      }

      return value ? [value as Record<string, any>] : [];
    });
  };

  const buildPayload = (form: Record<string, string>) => ({
    name: form.name,
    sku: form.sku,
    price: parseFloat(form.price),
    currency: form.currency,
    category_code: form.category_code,
    inStock: form.inStock === "true",
    rating: parseFloat(form.rating),
    reviews: parseInt(form.reviews, 10),
    imagePath: form.imagePath,
  });

  return (
    <GenericTable
      endpoint="product"
      label="Product"
      columns={columns}
      fields={fields}
      buildPayload={buildPayload}
      transformResponse={transformResponse}
    />
  );
};

export default Product;
