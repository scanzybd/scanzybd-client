import React, { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { PRODUCT_IMAGE_SLOTS, productImageUrl } from "../../lib/productImages";
import { compressImageFileForUpload } from "../../lib/compressImageForUpload";

/**
 * Up to 4 product image slots — compress client-side, upload via /api/upload/image (Cloudinary).
 * `images` is a length-4 string array; empty string = vacant slot.
 */
export default function ProductImageSlots({
  images,
  onChange,
  axiosSecure,
  disabled = false,
}) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState(null);

  const slots = Array.from(
    { length: PRODUCT_IMAGE_SLOTS },
    (_, i) => (Array.isArray(images) ? images[i] : "") || ""
  );

  const setSlot = (index, url) => {
    const next = [...slots];
    next[index] = url;
    onChange(next);
  };

  const clearSlot = (index) => {
    setSlot(index, "");
    setError(null);
  };

  const handleFile = async (index, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError(null);
    setUploadingIndex(index);

    try {
      const dataUrl = await compressImageFileForUpload(file);
      const res = await axiosSecure.post("/api/upload/image", { image: dataUrl });
      const url = res.data?.url;
      if (!url) throw new Error(res.data?.message || "No URL returned");
      setSlot(index, url);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Image upload failed";
      setError(
        /network error/i.test(msg)
          ? "Upload failed (file too large or connection issue). Try again — images are compressed automatically."
          : msg
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="mb-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-3">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Product images (up to {PRODUCT_IMAGE_SLOTS})
      </label>
      <p className="mb-3 text-xs text-gray-500">
        First image is the cover (lists, cart, spotlight). All four show on the product details page.
        Photos are compressed in the browser, then uploaded to Cloudinary (URL saved in the database).
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {slots.map((url, index) => {
          const busy = uploadingIndex === index;
          return (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {url ? (
                <>
                  <img
                    src={productImageUrl(url, "admin")}
                    alt={`Product ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    disabled={disabled || busy}
                    onClick={() => clearSlot(index)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {index === 0 ? (
                    <span className="absolute left-1.5 top-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-900">
                      Cover
                    </span>
                  ) : null}
                </>
              ) : (
                <label
                  className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50 ${
                    disabled || busy ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {busy ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[10px] font-medium">
                        {index === 0 ? "Cover" : `Image ${index + 1}`}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={disabled || busy || uploadingIndex != null}
                    onChange={(e) => handleFile(index, e)}
                  />
                </label>
              )}
              {url && !busy ? (
                <label className="absolute inset-x-0 bottom-0 cursor-pointer bg-black/55 py-1 text-center text-[10px] font-semibold text-white hover:bg-black/70">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={disabled || uploadingIndex != null}
                    onChange={(e) => handleFile(index, e)}
                  />
                </label>
              ) : null}
            </div>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
