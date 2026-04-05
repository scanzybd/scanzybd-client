import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("Form Data:", data);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-yellow-300 px-4">

            <div className="w-full max-w-sm">

                <div className="card shadow-xl bg-base-100">

                    {/* Header */}
                    <div className="px-6 pt-6 space-y-1 text-center">
                        <h1 className="text-3xl font-bold">Forgot Password</h1>
                        <p className="text-gray-600">
                            Enter your email and we’ll send a reset link.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="card-body">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Email */}
                            <div>
                                <label className="label font-medium">Email</label>
                                <input
                                    type="email"
                                    className="input input-bordered w-full"
                                    placeholder="Enter Email"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email format",
                                        },
                                    })}
                                />

                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Button */}
                            <button type="submit" className="btn btn-primary btn-block">
                                Send
                            </button>

                            {/* Login link */}
                            <div className="text-center text-sm opacity-80">
                                <span>Remember your password? </span>
                                <Link to="/login" className="link link-hover text-lime-700">
                                    Login
                                </Link>
                            </div>

                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;