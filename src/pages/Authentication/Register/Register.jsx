import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link,  } from "react-router-dom";
import SocialLogin from "../SocialLogin/SocialLogin";
import useAuth from "../../../hooks/useAuth";
import { COMPANY_NAME } from "../../../config/company";

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

        const { registerUser, updateUserProfile } = useAuth();


    const onSubmit = async (data) => {
    try {

 // 🔥 1. Firebase register
            const result = await registerUser(data.email, data.password);
            const firebaseUser = result.user;

            // 🔥 2. Update profile (name save)
            await updateUserProfile({
                displayName: data.name,
            });


        const payload = {
            name: data.name,
            email: data.email,
            password: data.password,
            uid: firebaseUser.uid,
            role: "user",
        };

        const res = await axios.post(
            "http://localhost:5000/api/auth/register",
            payload
        );

        console.log("REGISTER SUCCESS:", res.data);

        reset();
        alert("Registration successful!");

    } catch (error) {
        console.log(error);
        alert(error?.message || "Registration failed");
    }
};

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-100 px-4 transition-colors dark:bg-slate-950">
            <div className="card max-w-sm w-full shadow-2xl bg-base-100">

                {/* Header */}
                <div className="px-6 pt-6">
                    <h1 className="text-3xl mb-1">Create Account</h1>
                    <p className="text-gray-600">Register with {COMPANY_NAME}</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Name */}
                        <div>
                            <label className="label font-medium">Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="input input-bordered w-full"
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input input-bordered w-full"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                            {/* Phone */}
                        {/* <div>
                            <label className="label font-medium">Phone</label>
                            <input
                                type="text"
                                placeholder="017XXXXXXXX"
                                className="input input-bordered w-full"
                                {...register("phone", {
                                    required: "Phone is required",
                                    pattern: {
                                        value: /^(01[3-9]\d{8})$/,
                                        message: "Enter valid BD number",
                                    },
                                })}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm">{errors.phone.message}</p>
                            )}
                        </div> */}

                        {/* Password */}
                        <div>
                            <label className="label font-medium">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input input-bordered w-full"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Minimum 6 characters",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Button */}
                        <button type="submit" className="btn w-full">
                            Register
                        </button>

                        {/* Login link */}
                        <div className="flex items-center gap-2 opacity-70">
                            <span>Already have an account?</span>
                            <Link to="/login" className="link link-hover">
                                Login
                            </Link>
                        </div>

                        {/* Provider
                        <div className="text-center text-sm">
                            <Link to="/provider-register" className="link text-orange-500">
                                Register as Provider
                            </Link>
                        </div> */}

                        {/* Social */}
                        <div className="text-center opacity-50">Or</div>
                        <SocialLogin />
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;