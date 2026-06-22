import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { fieldInput, textMuted } from "../lib/uiClasses";
import useTagTypes from "../hooks/useTagTypes";
import { isCycleTagType, isDriverlessTagType } from "../lib/tagTypeUtils";
import { normalizeBrtaOptions, formatRegNumberInput } from "../lib/vehicleFormUtils";

function RequiredStar() {
  return (
    <span className="text-rose-600 dark:text-rose-400" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/**
 * Vehicle fields aligned with Checkout step 3.
 * Parent owns `form` state — use createEmptyVehicleForm() from vehicleFormUtils.
 */
const AddVehicleForm = ({
  form,
  onPatch,
  isCycleTag: isCycleTagProp,
  showTagTypeSelector = true,
  brtaZones: brtaZonesProp,
  brtaSeries: brtaSeriesProp,
  brtaLoadError: brtaLoadErrorProp,
  onBrtaLoaded,
  showDriverSection = true,
  children,
  className = "",
}) => {
  const axiosSecure = useAxiosSecure();
  const { data: tagTypes = [], isLoading: tagTypesLoading } = useTagTypes();
  const [brtaZones, setBrtaZones] = useState([]);
  const [brtaSeries, setBrtaSeries] = useState([]);
  const [brtaLoadError, setBrtaLoadError] = useState(null);

  const zones = brtaZonesProp ?? brtaZones;
  const series = brtaSeriesProp ?? brtaSeries;
  const loadError = brtaLoadErrorProp ?? brtaLoadError;

  const patch = onPatch || (() => {});

  const isCycleTag = showTagTypeSelector
    ? isCycleTagType(form.tagType, tagTypes)
    : Boolean(isCycleTagProp);

  // Cycle + bike tags have no driver concept — hide the whole driver section.
  const hideDriver = showTagTypeSelector
    ? isDriverlessTagType(form.tagType, tagTypes)
    : Boolean(isCycleTagProp);

  const fieldsReady = !showTagTypeSelector || Boolean(form.tagType);

  const handleTagTypeChange = (tagType) => {
    if (tagType === form.tagType) return;
    const nextCycle = isCycleTagType(tagType, tagTypes);
    const prevCycle = isCycleTagType(form.tagType, tagTypes);
    const nextDriverless = isDriverlessTagType(tagType, tagTypes);
    const prevDriverless = isDriverlessTagType(form.tagType, tagTypes);

    const next = { tagType };
    if (nextCycle !== prevCycle) {
      Object.assign(next, {
        zone: "",
        series: "",
        regNumber: "",
        chassisLast4: "",
        engineLast4: "",
        plate: "",
      });
    }
    if (nextDriverless && !prevDriverless) {
      Object.assign(next, {
        addDriver: false,
        driverName: "",
        driverPhone: "",
        driverContactVisible: false,
      });
    }
    patch(next);
  };

  useEffect(() => {
    if (isCycleTag || brtaZonesProp !== undefined) return;

    let cancelled = false;

    (async () => {
      try {
        setBrtaLoadError(null);
        const [zonesRes, seriesRes] = await Promise.all([
          axiosSecure.get("/api/locations/brta-zones"),
          axiosSecure.get("/api/locations/brta-series"),
        ]);
        if (cancelled) return;
        const z = normalizeBrtaOptions(zonesRes?.data);
        const s = normalizeBrtaOptions(seriesRes?.data);
        setBrtaZones(z);
        setBrtaSeries(s);
        onBrtaLoaded?.({ zones: z, series: s });
        if (z.length === 0 || s.length === 0) {
          setBrtaLoadError("Zone or series list is empty.");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load BRTA options", error);
        setBrtaLoadError(
          error?.response?.data?.message || "Could not load zone/series."
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isCycleTag, brtaZonesProp, axiosSecure, onBrtaLoaded]);

  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`.trim()}>
      {showTagTypeSelector && (
        <label className="block sm:col-span-2">
          <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
            Tag type
            <RequiredStar />
          </span>
          <select
            className={fieldInput}
            value={form.tagType || ""}
            onChange={(e) => handleTagTypeChange(e.target.value)}
            disabled={tagTypesLoading}
          >
            <option value="">
              {tagTypesLoading ? "Loading tag types…" : "Select tag type…"}
            </option>
            {tagTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {showTagTypeSelector && !form.tagType ? (
        <p className={`sm:col-span-2 text-sm ${textMuted}`}>
          Choose a tag type to show the correct vehicle fields.
        </p>
      ) : null}

      {fieldsReady && (isCycleTag ? (
        <label className="block sm:col-span-2">
          <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
            Chassis No.
            <RequiredStar />
          </span>
          <input
            className={`${fieldInput} font-mono`}
            value={form.plate || ""}
            onChange={(e) => patch({ plate: e.target.value })}
            placeholder="Full chassis number"
          />
        </label>
      ) : (
        <>
          {loadError && (
            <p className="sm:col-span-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {loadError}
            </p>
          )}
          <label className="block">
            <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
              Zone
              <RequiredStar />
            </span>
            <select
              className={fieldInput}
              value={form.zone || ""}
              onChange={(e) => patch({ zone: e.target.value })}
              disabled={zones.length === 0}
            >
              <option value="">
                {zones.length === 0 ? "Loading zones…" : "Select zone"}
              </option>
              {zones.map((opt, zi) => (
                <option key={`${opt.value}-${zi}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
              Series
              <RequiredStar />
            </span>
            <select
              className={fieldInput}
              value={form.series || ""}
              onChange={(e) => patch({ series: e.target.value })}
              disabled={series.length === 0}
            >
              <option value="">
                {series.length === 0 ? "Loading series…" : "Select series"}
              </option>
              {series.map((opt, si) => (
                <option key={`${opt.value}-${si}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
              Registration No.
              <RequiredStar />
            </span>
            <input
              className={`${fieldInput} font-mono`}
              value={form.regNumber || ""}
              onChange={(e) => patch({ regNumber: formatRegNumberInput(e.target.value) })}
              placeholder="e.g. 12-3322"
              inputMode="numeric"
              maxLength={7}
            />
          </label>
        </>
      ))}

      {fieldsReady && (
      <>
      <label className="block">
        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
          Manufacture Year
          <RequiredStar />
        </span>
        <input
          className={fieldInput}
          value={form.model || ""}
          onChange={(e) => patch({ model: e.target.value })}
          placeholder="e.g. 2019"
        />
      </label>

      {!isCycleTag && (
        <>
          <label className="block">
            <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
              Chassis No. (last 4 digits)
              <RequiredStar />
            </span>
            <input
              className={`${fieldInput} font-mono`}
              value={form.chassisLast4 || ""}
              onChange={(e) =>
                patch({
                  chassisLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                })
              }
              placeholder="e.g. 4521"
              inputMode="numeric"
              maxLength={4}
            />
          </label>
          <label className="block">
            <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
              Engine No. (last 4 digits)
              <RequiredStar />
            </span>
            <input
              className={`${fieldInput} font-mono`}
              value={form.engineLast4 || ""}
              onChange={(e) =>
                patch({
                  engineLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                })
              }
              placeholder="e.g. 8834"
              inputMode="numeric"
              maxLength={4}
            />
          </label>
        </>
      )}

      <label className="block sm:col-span-2">
        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
          Owner phone
          <RequiredStar />
        </span>
        <input
          className={fieldInput}
          value={form.ownerPhone || ""}
          onChange={(e) =>
            patch({ ownerPhone: e.target.value.replace(/\D/g, "").slice(0, 11) })
          }
          placeholder="01XXXXXXXXX"
          inputMode="tel"
          maxLength={11}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
          Emergency contact phone
          <RequiredStar />
        </span>
        <input
          className={fieldInput}
          value={form.emergencyPhone || ""}
          onChange={(e) =>
            patch({
              emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 11),
            })
          }
          placeholder="01XXXXXXXXX"
          inputMode="tel"
          maxLength={11}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
          Owner contact permission
        </span>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={Boolean(form.ownerContactVisible)}
            onChange={(e) => patch({ ownerContactVisible: e.target.checked })}
          />
          Show owner contact on page
        </label>
      </label>

      <label className="block sm:col-span-2">
        <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
          Emergency contact permission
        </span>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={Boolean(form.emergencyContactVisible)}
            onChange={(e) => patch({ emergencyContactVisible: e.target.checked })}
          />
          Allow page to show emergency contact
        </label>
      </label>

      {!hideDriver && (
        <label className="block sm:col-span-2">
          <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
            Driver contact permission
          </span>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={Boolean(form.driverContactVisible)}
              onChange={(e) => patch({ driverContactVisible: e.target.checked })}
            />
            Show driver contact on page
          </label>
        </label>
      )}

      {showDriverSection && !hideDriver && (
        <div className="mt-1 border-t border-slate-200 pt-3 sm:col-span-2 dark:border-slate-700">
          <button
            type="button"
            onClick={() => patch({ addDriver: !form.addDriver })}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <span>Driver (optional)</span>
            {form.addDriver ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {form.addDriver && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                  Driver name
                  <RequiredStar />
                </span>
                <input
                  className={fieldInput}
                  value={form.driverName || ""}
                  onChange={(e) => patch({ driverName: e.target.value })}
                  placeholder="Driver name"
                />
              </label>
              <label className="block">
                <span className={`mb-1 block text-xs font-medium ${textMuted}`}>
                  Driver phone
                  <RequiredStar />
                </span>
                <input
                  className={fieldInput}
                  value={form.driverPhone || ""}
                  onChange={(e) => patch({ driverPhone: e.target.value })}
                  placeholder="Driver phone"
                  inputMode="tel"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {children ? <div className="sm:col-span-2">{children}</div> : null}
      </>
      )}
    </div>
  );
};

export default AddVehicleForm;
