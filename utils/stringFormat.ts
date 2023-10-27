function getStringBeforeAtSign(email: string) {
    const parts = email.split('@');

    if (parts.length > 1) {
        return parts[0];
    } else {
        return email;
    }
}

export { getStringBeforeAtSign }