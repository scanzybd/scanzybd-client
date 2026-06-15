export const PACKAGE_CATEGORIES = [
  {
    value: "starter",
    label: "Starter",
    hint: "Homepage subtitle: Starter package",
  },
  {
    value: "standard",
    label: "Standard",
    hint: "Homepage subtitle: Standard package",
  },
  {
    value: "premium",
    label: "Premium",
    hint: "Homepage subtitle: Premium package",
  },
];

export function emptyPackageForm() {
  return {
    title: "",
    price: "",
    description: "",
    features: [""],
    highlight: false,
    category: "starter",
  };
}

export function packageToForm(pkg) {
  if (!pkg) return emptyPackageForm();
  const features =
    Array.isArray(pkg.features) && pkg.features.length > 0 ? [...pkg.features] : [""];
  return {
    title: pkg.title ?? "",
    price: pkg.price != null ? String(pkg.price) : "",
    description: pkg.description ?? "",
    features,
    highlight: Boolean(pkg.highlight),
    category: pkg.category || "starter",
  };
}

export function parseFeatures(features) {
  if (!Array.isArray(features)) return [];
  return features.map((item) => String(item || "").trim()).filter(Boolean);
}

export function validatePackageForm(form) {
  const errors = {};
  const title = String(form.title || "").trim();

  if (!title) {
    errors.title = "Title is required";
  } else if (title.length < 2) {
    errors.title = "Title must be at least 2 characters";
  }

  const description = String(form.description || "").trim();
  if (!description) {
    errors.description = "Description is required";
  } else if (description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  const price = Number(form.price);
  if (form.price === "" || form.price == null) {
    errors.price = "Price is required";
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Enter a valid price greater than 0";
  }

  const features = parseFeatures(form.features);
  if (features.length === 0) {
    errors.features = "Add at least one feature";
  }

  const category = String(form.category || "");
  if (!["starter", "standard", "premium"].includes(category)) {
    errors.category = "Choose a valid category";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    features,
  };
}

export function buildPackagePayload(form, features) {
  return {
    title: String(form.title).trim(),
    price: Number(form.price),
    description: String(form.description).trim(),
    features,
    highlight: Boolean(form.highlight),
    category: form.category,
    currency: "BDT",
  };
}
