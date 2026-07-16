const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function parseApiResponse(response) {
    if (response.ok) {
        return response.json();
    }

    let message = `Request failed with status ${response.status}`;

    try {
        const errorData = await response.json();
        message = errorData.detail || message;
    } catch {
        // Response did not contain JSON.
    }

    throw new Error(message);
}

export async function getAdminCustomers() {
    const response = await fetch(
        `${API_BASE_URL}/admin/customers`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    return parseApiResponse(response);
}

export async function getAdminCustomerDetails(customerId) {
    if (!customerId) {
        throw new Error("Customer ID is required.");
    }

    const response = await fetch(
        `${API_BASE_URL}/admin/customers/${encodeURIComponent(customerId)}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    return parseApiResponse(response);
}

export async function verifyCustomer(customerId) {
    if (!customerId) {
        throw new Error("Customer ID is required.");
    }

    const response = await fetch(
        `${API_BASE_URL}/admin/customers/${encodeURIComponent(customerId)}/verify`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
            },
        }
    );

    return parseApiResponse(response);
}

export async function suspendAdminCustomer(customerId) {
    if (!customerId) {
        throw new Error("Customer ID is required.");
    }

    const response = await fetch(
        `${API_BASE_URL}/admin/customers/${encodeURIComponent(customerId)}/suspend`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
            },
        }
    );

    return parseApiResponse(response);
}

export async function reactivateAdminCustomer(customerId) {
    if (!customerId) {
        throw new Error("Customer ID is required.");
    }

    const response = await fetch(
        `${API_BASE_URL}/admin/customers/${encodeURIComponent(customerId)}/reactivate`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
            },
        }
    );

    return parseApiResponse(response);
}