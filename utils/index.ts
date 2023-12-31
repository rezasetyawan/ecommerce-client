export const  getStringBeforeAtSign = (email: string) => {
    const parts = email.split('@');

    if (parts.length > 1) {
        return parts[0];
    } else {
        return email;
    }
}

export const toRupiah = (price: number) => {
    return "Rp. " + price.toLocaleString("id-ID");
};

export const formatDate = (millisecondsTimestamp: string): string => {
    const dateObject = new Date(parseInt(millisecondsTimestamp));
    const options: object = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    const formattedDate = dateObject.toLocaleString(undefined, options);
    return formattedDate;
  };
