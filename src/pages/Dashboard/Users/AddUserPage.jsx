import React from "react";
import CreateUserForm from "./CreateUserForm";

const AddUserPage = () => {
    return (
        <CreateUserForm
            role="user"
            badge="Customer"
            title="Add user"
            description="Register a customer account. They will use the same email and password on the login page."
        />
    );
};

export default AddUserPage;
