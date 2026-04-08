import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import React from 'react';

const AllOrders = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data = [], isLoading, refetch } = useQuery({
        queryKey: ['myParcels', user.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels?email=${user.email}`);
            return res.data;
        }
    });

    const handleView = (parcel) => {
        Swal.fire({
            title: "Parcel Details",
            html: `
        <p><strong>Parcel Name:</strong> ${parcel.parcelName}</p>
        <p><strong>Parcel Type:</strong> ${parcel.parcelType}</p>
        <p><strong>Sender:</strong> ${parcel.senderName} (${parcel.senderEmail})</p>
        <p><strong>Receiver:</strong> ${parcel.receiverName} (${parcel.receiverEmail})</p>
        <p><strong>Cost:</strong> ${parcel.cost}</p>
        <p><strong>COD:</strong> ${parcel.cod ? "Yes" : "No"}</p>
      `,
        });
    };

    const handlePay = (parcel) => {
        Swal.fire("Payment", `Paying for parcel: ${parcel.tracking_id}`, "info");
        // Here you can call your payment API
    };

    const handleDelete = async (parcel) => {
        // Show confirmation first
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You want to delete ${parcel.parcelName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                // Call your delete API
                const response = await axiosSecure.delete(`/parcels/${parcel._id}`);

                // Check if deletion was successful
                if (response.data.deletedCount > 0) {
                    Swal.fire("Deleted!", `${parcel.parcelName} has been deleted.`, "success");
                    // Optionally, refetch or remove the item from your local state/query
                } else {
                    Swal.fire("Failed!", "Parcel could not be deleted.", "error");
                }
            } catch (error) {
                console.error("Delete error:", error);
                Swal.fire("Error", "Something went wrong while deleting.", "error");
            }
            refetch()
        }
    };


    if (isLoading) {
        return <p>Loading parcels...</p>;
    }

    return (
        <div className="overflow-x-auto w-full">
            <h1 className="text-2xl font-bold mb-4">My Parcels ({data.length})</h1>
            <table className="table w-full">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Parcel Type</th>
                        <th>Created At</th>
                        <th>Cost</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((parcel, index) => (
                        <tr key={parcel._id}>
                            <td>{index + 1}</td>
                            <td className='max-W-[180px] truncate'>{parcel.parcelName}</td>
                            <td className='capitalize'>{parcel.parcelType}</td>
                            <td>{new Date(parcel.createdAt).toLocaleString()}</td>
                            <td>{parcel.cost}</td>
                            <td>
                                <span
                                    className={`px-2 py-1 rounded-lg font-semibold text-white ${parcel.payment_status === "paid" ? "bg-green-500" : "bg-red-500"
                                        }`}
                                >
                                    {parcel.payment_status}
                                </span>
                            </td>
                            <td className="flex gap-2">
                                <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => handleView(parcel)}
                                >
                                    View
                                </button>
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handlePay(parcel)}
                                    disabled={parcel.payment_status === "paid"}
                                >
                                    Pay
                                </button>
                                <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => handleDelete(parcel)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllOrders;
