import GenericTable, { type ColumnConfig, type FieldConfig } from "./GenericTable";

const Category: React.FC = () => {
  const fields: FieldConfig[] = [
    { name: "id", label: "Category ID", type: "number", placeholder: "Auto-filled when editing" },
    { name: "code", label: "Category Code", type: "text", required: true },
    { name: "name", label: "Category Name", type: "text", required: true },
  ];

  const columns: ColumnConfig[] = [
    { header: "ID", key: "id" },
    { header: "Code", key: "code" },
    { header: "Name", key: "name" },
  ];

  const buildPayload = (form: Record<string, string>) => ({
    code: form.code,
    name: form.name,
  });

  return (
    <GenericTable
      endpoint="category"
      label="Category"
      columns={columns}
      fields={fields}
      buildPayload={buildPayload}
    />
  );
};

export default Category;
