import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useAuthorization } from "../ctx/AuthenticationContext";
import api from "../api/client";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  options?: { value: string; label: string }[];
}

export interface ColumnConfig {
  header: string;
  key: string;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

export interface GenericTableProps {
  endpoint: string;
  label: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  buildPayload: (form: Record<string, string>) => Record<string, any>;
  transformResponse?: (data: any) => Record<string, any>[];
}

const GenericTable: React.FC<GenericTableProps> = ({
  endpoint,
  label,
  columns,
  fields,
  buildPayload,
  transformResponse,
}) => {
  const { isAuthenticated } = useAuthorization();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const sectionId = `${label.toLowerCase()}s-section`;

  const resetForm = () => {
    const empty: Record<string, string> = {};
    fields.forEach((f) => {
      empty[f.name] = "";
    });
    setForm(empty);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      let list: Record<string, any>[] = [];
      if (transformResponse) {
        list = transformResponse(data);
      } else if (Array.isArray(data)) {
        list = data;
      } else {
        list = data?.items ?? data?.data ?? [];
      }
      setItems(list);
    } catch (error) {
      console.error(`Failed to load ${label.toLowerCase()}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  useEffect(() => {
    resetForm();
  }, [fields]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const hasId = Boolean(form.id);
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (hasId) {
        await api.post(
          `${endpoint}/${encodeURIComponent(form.category_code ?? form.code ?? form.id)}/${encodeURIComponent(form.id)}`,
          payload
        );
      } else {
        await api.post(endpoint, payload);
      }
      await fetchItems();
      resetForm();
    } catch (error: any) {
      console.error(`Failed to save ${label.toLowerCase()}:`, error);
      alert(error?.message ?? `Failed to save ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: Record<string, any>) => {
    const next: Record<string, string> = {};
    fields.forEach((f) => {
      const v = row[f.name];
      next[f.name] = v == null ? "" : String(v);
    });
    setForm(next);
    document.querySelector(`#${sectionId}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (row: Record<string, any>) => {
    if (!window.confirm(`Delete this ${label.toLowerCase()}?`)) return;
    try {
      await api.delete(
        `${endpoint}/${encodeURIComponent(row.category_code ?? row.code ?? row.id)}/${encodeURIComponent(row.id)}`
      );
      await fetchItems();
    } catch (error: any) {
      console.error(`Failed to delete ${label.toLowerCase()}:`, error);
      alert(error?.message ?? `Failed to delete ${label.toLowerCase()}`);
    }
  };

  const renderField = (field: FieldConfig) => {
    const commonProps = {
      id: `${sectionId}-${field.name}`,
      name: field.name,
      value: form[field.name] ?? "",
      onChange: handleChange,
      disabled: saving,
      required: field.required,
    };

    if (field.type === "select") {
      return (
        <select {...commonProps}>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        {...commonProps}
        type={field.type ?? "text"}
        placeholder={field.placeholder}
        step={field.step}
        min={field.min}
        max={field.max}
      />
    );
  };

  return (
    <section className="section" id={sectionId}>
      <h2>{`${label}s`}</h2>

      {isAuthenticated && (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {fields.slice(0, 2).map((field) => (
              <div className="form-group" key={field.name}>
                <label htmlFor={`${sectionId}-${field.name}`}>
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {fields.length > 2 && (
            <div className="form-row">
              {fields.slice(2).map((field) => (
                <div className="form-group" key={field.name}>
                  <label htmlFor={`${sectionId}-${field.name}`}>
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          <div className="toolbar-actions">
            <button type="submit" disabled={saving} className="success">
              {saving ? "Saving..." : form.id ? `Update ${label}` : `Add ${label}`}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="danger"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
            {isAuthenticated && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (isAuthenticated ? 1 : 0)}
                className="empty-state"
              >
                {loading ? "Loading..." : `No ${label.toLowerCase()}s`}
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={`${item.id}-${col.key}`}>
                  {col.render
                    ? col.render(item[col.key], item)
                    : String(item[col.key] ?? "")}
                </td>
              ))}
              {isAuthenticated && (
                <td>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default GenericTable;
