const CLIENT_NAMES: Record<string, string> = {
    "quilt-cli": "quilt CLI",
};

interface DeviceVerification {
    status: string;
    client_id?: string;
    scope?: string | null;
}

export function toDeviceRequest(verification: DeviceVerification) {
    if (verification.status !== "pending" || !verification.client_id) {
        throw new Error("This code is not waiting for approval");
    }
    return {
        clientId:
            CLIENT_NAMES[verification.client_id] ?? verification.client_id,
        scopes: verification.scope?.split(" ").filter(Boolean) ?? [],
    };
}
