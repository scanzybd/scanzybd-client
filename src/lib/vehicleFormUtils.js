import { isCycleTagType as isCycleTagTypeFromDb } from "./tagTypeUtils";

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
  const plate = isCycleTag
    ? String(form.plate || "").trim()
    : `${form.zone}-${form.series}-${String(form.regNumber || "").trim()}`;

  const payload = {
    vehicleName: String(form.model || "").trim() || "Vehicle",
    model: String(form.model || "").trim(),
    plate,
    ownerPhone: String(form.ownerPhone || "").trim(),
    emergencyPhone: String(form.emergencyPhone || "").trim(),
    ownerContactVisible: Boolean(form.ownerContactVisible),
    emergencyContactVisible: Boolean(form.emergencyContactVisible),
    driverContactVisible: !isCycleTag && Boolean(form.driverContactVisible),
  };

  if (!isCycleTag) {
    payload.chassisLast4 = String(form.chassisLast4 || "").trim();
    payload.engineLast4 = String(form.engineLast4 || "").trim();
  }

  if (!isCycleTag && form.addDriver && form.driverName?.trim() && form.driverPhone?.trim()) {
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
  if (!isCycleTag && form.addDriver) {
    if (!form.driverName?.trim() || !form.driverPhone?.trim()) {
      return "Add driver name and phone, or turn off driver.";
    }
  }
  return null;
}
