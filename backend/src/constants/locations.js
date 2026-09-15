const KIFLE_OPTIONS = [
    "Abema",
    "Menkorer",
    "Negus Teklehaymanot",
    "Tedla Gualu",
];

const LOCATION_DATA = {
    Abema: ["1", "2", "3", "4"],
    Menkorer: ["1", "2", "3", "4"],
    "Negus Teklehaymanot": ["1", "2", "3", "4"],
    "Tedla Gualu": ["1", "2", "3", "4", "5"],
};

const SEFER_OPTIONS = ["1", "2", "3", "4"];

exports.KIFLE_OPTIONS = KIFLE_OPTIONS;
exports.SEFER_OPTIONS = SEFER_OPTIONS;

exports.getLocationOptionsFor = (kifleKetema) => {
    if (!kifleKetema) return null;

    const key = KIFLE_OPTIONS.find(
        (name) => name.toLowerCase() === kifleKetema.trim().toLowerCase()
    );

    if (!key) return null;

    const kebeles = LOCATION_DATA[key];

    return {
        kebeles,
        sefers: kebeles.flatMap((kebele) =>
            SEFER_OPTIONS.map((sefer) => ({ kebele, sefer }))
        ),
    };
};