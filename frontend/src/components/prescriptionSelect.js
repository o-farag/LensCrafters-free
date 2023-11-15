import { Select } from '@mantine/core';

function fillSphData(isPositive) {
    var data = isPositive ? ['0.00'] : [];
    for (let i = 0.25; i <= 20; i += 0.25) {
        const formatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 });
        const formattedValue = formatter.format(i);
        isPositive ? data.push('+' + formattedValue) : data.push('-' + formattedValue);
    }
    return data;
}

const positiveSph = fillSphData(true);
const negativeSph = fillSphData(false);

export function PrescriptionSelect(props) {
    return (
        <Select
            pt='0.5em'
            searchable
            label=''
            data={[
                { group: '+', items: positiveSph },
                { group: '-', items: negativeSph },
            ]}
            placeholder='0.00'
            value={props.data}
            onChange={(value) => props.setData(value)}
        />
    );
}