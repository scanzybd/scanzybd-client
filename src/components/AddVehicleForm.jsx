import React from "react";

const AddVehicleForm = ({
  form,
  setForm,
  driver,
  setDriver,
  showDriverForm,
  setShowDriverForm,
  scannedQR,
  setScannedQR,
  handleSubmit,
}) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-3 bg-white p-4 shadow rounded">

      {/* VEHICLE NAME */}
      <input
        name="vehicleName"
        value={form.vehicleName}
        onChange={handleChange}
        placeholder="Vehicle Name"
        className="w-full border p-2 rounded"
      />

      {/* MODEL */}
      <input
        name="model"
        value={form.model}
        onChange={handleChange}
        placeholder="Model"
        className="w-full border p-2 rounded"
      />

      {/* PLATE */}
      <input
        name="plate"
        value={form.plate}
        onChange={handleChange}
        placeholder="Dhaka Metro 00-0000"
        className="w-full border p-2 rounded"
      />

      {/* DRIVER TOGGLE */}
      <button
        type="button"
        onClick={() => setShowDriverForm(!showDriverForm)}
        className="text-blue-600 text-sm"
      >
        {showDriverForm ? "Remove Driver" : "Add Driver"}
      </button>

      {/* DRIVER FORM */}
      {showDriverForm && (
        <div className="space-y-2">
          <input
            value={driver.name}
            onChange={(e) =>
              setDriver({ ...driver, name: e.target.value })
            }
            placeholder="Driver Name"
            className="w-full border p-2 rounded"
          />

          <input
            value={driver.phone}
            onChange={(e) =>
              setDriver({ ...driver, phone: e.target.value })
            }
            placeholder="Driver Phone"
            className="w-full border p-2 rounded"
          />
        </div>
      )}

      {/* QR INPUT */}
      <input
        value={scannedQR || ""}
        onChange={(e) => setScannedQR(e.target.value)}
        placeholder="QR Data (optional)"
        className="w-full border p-2 rounded"
      />

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Add Vehicle
      </button>
    </div>
  );
};

export default AddVehicleForm;