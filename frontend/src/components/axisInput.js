import { NumberInput } from '@mantine/core';

export function AxisInput() {
    return (
        <NumberInput 
            pt='0.5em'
            label=''
            defaultValue={0}
            min={0}
            max={180}
            placeholder={0} />
    );
}