const diffrenceTime = (date) => {
    const createdAtDate = new Date(date);
    const now = new Date();

    const diffInMs = now - createdAtDate;

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    let formattedDate;
    if (diffInMinutes < 1) {
        formattedDate = 'just now';
    } else if (diffInMinutes < 60) {
        formattedDate = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        formattedDate = `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
        formattedDate = `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    return formattedDate
}


export default diffrenceTime


