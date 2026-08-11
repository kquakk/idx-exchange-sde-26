import "./OpenHouseList.css";

function extractRemarks(allData) {
    if (!allData) {
        return null;
    }

    if (typeof allData === "object") {
        return allData.OpenHouseRemarks || null;
    }

    try {
        const parsed = JSON.parse(allData);
        return parsed?.OpenHouseRemarks || null;
    } catch {
        return null;
    }
}

function formatDate(value) {
    if (!value) {
        return "Date TBD";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

function formatTime(value) {
    if (!value) return null;

    const match = String(value).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return String(value);

    let hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
}

function OpenHouseList({ openHouses }) {
    if (!openHouses || openHouses.length === 0) {
        return (
            <div className="open-houses">
                <h2>Open Houses</h2>
                <p className="open-houses__empty">No open houses scheduled</p>
            </div>
        );
    }

    return (
        <div className="open-houses">
            <h2>Open Houses</h2>
            <ul className="open-houses__list">
                {openHouses.map((oh, i) => {
                    const remarks = extractRemarks(oh.all_data);
                    const start = formatTime(oh.OH_StartTime);
                    const end = formatTime(oh.OH_EndTime);

                    return (
                        <li key={i} className="open-houses__item">
                            <div className="open-houses__date">
                                {formatDate(oh.OpenHouseDate)}
                            </div>
                            {(start || end) && (
                                <div className="open-houses__time">
                                    {start}
                                    {end ? ` – ${end}` : ""}
                                </div>
                            )}
                            {remarks && (
                                <div className="open-houses__remarks">
                                    {remarks}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default OpenHouseList;