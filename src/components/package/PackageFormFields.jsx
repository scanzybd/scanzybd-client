import { Plus, Trash2 } from "lucide-react";
import { fieldInput, textMuted } from "../../lib/uiClasses";
import { PACKAGE_CATEGORIES } from "../../lib/packageFormUtils";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{message}</p>;
}

export default function PackageFormFields({
  form,
  errors = {},
  onFieldChange,
  onFeatureChange,
  onAddFeature,
  onRemoveFeature,
  idPrefix = "pkg",
}) {
  const selectedCategory = PACKAGE_CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-title`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Package title <span className="text-red-500">*</span>
        </label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          name="title"
          value={form.title}
          onChange={onFieldChange}
          placeholder="e.g. Growth Pack"
          className={fieldInput}
          autoComplete="off"
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-price`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Price (BDT) <span className="text-red-500">*</span>
        </label>
        <input
          id={`${idPrefix}-price`}
          type="number"
          name="price"
          min="1"
          step="1"
          value={form.price}
          onChange={onFieldChange}
          placeholder="e.g. 2999"
          className={fieldInput}
        />
        <FieldError message={errors.price} />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-description`}
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          value={form.description}
          onChange={onFieldChange}
          rows={4}
          placeholder="Short summary shown on the homepage offer card"
          className={fieldInput}
        />
        <FieldError message={errors.description} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Features <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={onAddFeature}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add line
          </button>
        </div>
        <p className={`mb-2 text-xs ${textMuted}`}>One feature per line — shown under “What&apos;s Included” on the homepage.</p>
        <ul className="space-y-2">
          {form.features.map((feature, index) => (
            <li key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => onFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className={fieldInput}
              />
              {form.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveFeature(index)}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:hover:bg-red-950/40"
                  aria-label="Remove feature"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <FieldError message={errors.features} />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-category`} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id={`${idPrefix}-category`}
          name="category"
          value={form.category}
          onChange={onFieldChange}
          className={fieldInput}
        >
          {PACKAGE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {selectedCategory?.hint && (
          <p className={`mt-1 text-xs ${textMuted}`}>{selectedCategory.hint}</p>
        )}
        <FieldError message={errors.category} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/50">
        <input
          type="checkbox"
          name="highlight"
          checked={form.highlight}
          onChange={onFieldChange}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Highlight on homepage
          </span>
          <span className={`text-xs ${textMuted}`}>
            Shows a “Popular” badge and emphasized card style in Offer Showcase.
          </span>
        </span>
      </label>
    </div>
  );
}
