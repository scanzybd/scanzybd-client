import React from "react";
import { useForm } from "react-hook-form";

const ResetPassword = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("Reset Password Data:", data);
    };

    const newPassword = watch("newPassword");

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-yellow-300 px-4">

            <div className="w-full max-w-sm">

                <div className="card shadow-2xl bg-base-100">

                    {/* Header */}
                    <div className="px-6 pt-6 text-center space-y-1">
                        <h1 className="text-3xl font-bold">Reset Password</h1>
                        <p className="text-gray-600">Create a new password</p>
                    </div>

                    {/* Form */}
                    <div className="card-body">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* New Password */}
                            <div>
                                <label className="label font-medium">New Password</label>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="input input-bordered w-full"
                                    {...register("newPassword", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Minimum 6 characters required",
                                        },
                                    })}
                                />
                                {errors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="label font-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="input input-bordered w-full"
                                    {...register("confirmPassword", {
                                        required: "Please confirm your password",
                                        validate: (value) =>
                                            value === newPassword || "Passwords do not match",
                                    })}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-block mt-2"
                            >
                                Reset Password
                            </button>

                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ResetPassword;