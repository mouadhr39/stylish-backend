import GenericTable, { type ColumnConfig, type FieldConfig } from "./GenericTable";

const Collection: React.FC = () => {
  const fields: FieldConfig[] = [
    { name: "id", label: "Collection ID", type: "number", placeholder: "Auto-filled when editing" },
    { name: "code", label: "Collection Code", type: "text", required: true },
    { name: "name", label: "Collection Name", type: "text", required: true },
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
      endpoint="collection"
      label="Collection"
      columns={columns}
      fields={fields}
      buildPayload={buildPayload}
    />
  );
};

export default Collection;
