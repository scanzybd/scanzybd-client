import React, { useRef } from "react";
import { useForm, Controller } from "react-hook-form";

const EnterCode = () => {
    const { handleSubmit, control, setValue, getValues } = useForm({
        defaultValues: { code: Array(6).fill("") },
    });

    const inputsRef = useRef([]);

    // Keep your existing functions intact
    const handleChange = (value, index) => {
        if (/^\d$/.test(value) || value === "") {
            setValue(`code.${index}`, value);
            if (value && index < inputsRef.current.length - 1) {
                inputsRef.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !getValues(`code.${index}`) && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("text").slice(0, 6);
        pasteData.split("").forEach((char, i) => {
            if (inputsRef.current[i] && /^\d$/.test(char)) {
                setValue(`code.${i}`, char);
            }
        });
        const nextIndex = Math.min(pasteData.length, 5);
        inputsRef.current[nextIndex].focus();
    };

    const onSubmit = (data) => {
        console.log("Entered Code:", data.code.join(""));
        // 👉 Call your verification API here
    };

    return (
        <div className="flex w-full h-screen items-center justify-center bg-yellow-300  px-4">
            <div className="card max-w-sm w-full shadow-2xl bg-base-100">
                <div className="px-6 pt-6">
                    <h1 className="text-3xl mb-2">Enter Code</h1>
                    <p className="text-gray-600 text-sm">
                        Enter 6 digit code that we sent to your email address
                    </p>
                </div>

                <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
                    {/* Code Inputs Row */}
                    <div className="grid grid-cols-6 gap-2 mb-4" onPaste={handlePaste}>
                        {Array(6)
                            .fill(0)
                            .map((_, index) => (
                                <Controller
                                    key={index}
                                    name={`code.${index}`}
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            maxLength="1"
                                            className="input text-center"
                                            ref={(el) => (inputsRef.current[index] = el)}
                                            onChange={(e) => handleChange(e.target.value, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                        />
                                    )}
                                />
                            ))}
                    </div>

                    {/* Verify Button */}
                    <button type="submit" className="btn  w-full">
                        Verify Code
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EnterCode;
