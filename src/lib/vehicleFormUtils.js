import {
  isCycleTagType as isCycleTagTypeFromDb,
  isBikeTagType,
} from "./tagTypeUtils";

export { isCycleTagTypeFromDb as isCycleTagType };

export function normalizeBrtaOptions(raw) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : [];
  return list
    .map((row) => ({
      label: String(row?.label ?? row?.title ?? row?.value ?? "").trim(),
      value: String(row?.value ?? row?.label ?? "").trim(),
    }))
    .filter((row) => row.label && row.value);
}

/**
 * Registration number input: 2 leading digits, then `-`, then up to 4 digits.
 * e.g. "123322" -> "12-3322".
 */
export function formatRegNumberInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export function createEmptyVehicleForm() {
  return {
    tagType: "",
    model: "",
    zone: "",
    series: "",
    regNumber: "",
    chassisLast4: "",
    engineLast4: "",
    plate: "",
    ownerPhone: "",
    ownerContactVisible: true,
    emergencyPhone: "",
    emergencyContactVisible: false,
    driverContactVisible: false,
    addDriver: false,
    driverName: "",
    driverPhone: "",
  };
}

export function buildVehicleAddPayload(form, isCycleTag) {
  // Cycle + bike tags carry no driver.
  const hideDriver = isCycleTag || isBikeTagType(form.tagType);
  const plate = isCycleTag
    ? String(form.plate || "").trim()
    : `${form.zone}-${form.series}-${String(form.regNumber || "").trim()}`;

  const payload = {
    vehicleName: String(form.model || "").trim() || "Vehicle",
    model: String(form.model || "").trim(),
    tagType: String(form.tagType || "").trim(),
    plate,
    ownerPhone: String(form.ownerPhone || "").trim(),
    emergencyPhone: String(form.emergencyPhone || "").trim(),
    ownerContactVisible: Boolean(form.ownerContactVisible),
    emergencyContactVisible: Boolean(form.emergencyContactVisible),
    driverContactVisible: !hideDriver && Boolean(form.driverContactVisible),
  };

  if (!isCycleTag) {
    payload.chassisLast4 = String(form.chassisLast4 || "").trim();
    payload.engineLast4 = String(form.engineLast4 || "").trim();
  }

  if (!hideDriver && form.addDriver && form.driverName?.trim() && form.driverPhone?.trim()) {
    payload.driver = {
      name: form.driverName.trim(),
      phone: form.driverPhone.trim(),
    };
  }

  return payload;
}

export function validateVehicleForm(form, isCycleTag) {
  if ("tagType" in form && !form.tagType?.trim()) {
    return "Select tag type.";
  }
  if (!form.model?.trim()) {
    return "Add manufacture year.";
  }
  if (isCycleTag) {
    if (!form.plate?.trim()) return "Add chassis number.";
  } else {
    if (!form.zone || !form.series || !form.regNumber?.trim()) {
      return "Fill zone, series, registration number, chassis and engine last 4 digits.";
    }
    if (!/^\d{4}$/.test(String(form.chassisLast4 || ""))) {
      return "Fill zone, series, registration number, chassis and engine last 4 digits.";
    }
    if (!/^\d{4}$/.test(String(form.engineLast4 || ""))) {
      return "Fill zone, series, registration number, chassis and engine last 4 digits.";
    }
  }
  if (!form.ownerPhone?.trim()) return "Add owner phone.";
  if (!form.emergencyPhone?.trim()) return "Add emergency contact phone.";
  if (!/^\d{11}$/.test(String(form.emergencyPhone || "").trim())) {
    return "Emergency contact phone must be 11 digits.";
  }
  const hideDriver = isCycleTag || isBikeTagType(form.tagType);
  if (!hideDriver && form.addDriver) {
    if (!form.driverName?.trim() || !form.driverPhone?.trim()) {
      return "Add driver name and phone, or turn off driver.";
    }
  }
  return null;
}
