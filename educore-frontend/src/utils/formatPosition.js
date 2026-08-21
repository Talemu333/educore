export function formatPosition(position) {

    if (!position) return "-";

    if (position % 100 >= 11 && position % 100 <= 13) {

        return `${position}th`;

    }

    switch (position % 10) {

        case 1:
            return `${position}st`;

        case 2:
            return `${position}nd`;

        case 3:
            return `${position}rd`;

        default:
            return `${position}th`;

    }

}