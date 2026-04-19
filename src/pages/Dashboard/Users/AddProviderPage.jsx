import React from "react";
import CreateUserForm from "./CreateUserForm";

const AddProviderPage = () => {
    return (
        <CreateUserForm
            role="provider"
            badge="Provider"
            title="Add provider"
            description="Create a provider account for staff who manage products, orders, and fleet tools in the dashboard."
        />
    );
};

export default AddProviderPage;
