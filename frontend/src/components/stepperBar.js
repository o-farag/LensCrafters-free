import {
  IconLicense,
  IconClick,
  IconEyeglass2,
  IconCircleCheck,
} from '@tabler/icons-react';
import { Stepper, rem } from '@mantine/core';

export function StepperBar(props) {

  return (
    <Stepper
      active={props.active}
      completedIcon={<IconCircleCheck style={{ width: rem(18), height: rem(18) }} />}
      size='sm'
      w='100%'
      mr='2em'
    >
      <Stepper.Step
        icon={<IconLicense style={{ width: rem(18), height: rem(18) }} />}
        label="Enter Prescription"
      />
      <Stepper.Step
        icon={<IconClick style={{ width: rem(18), height: rem(18) }} />}
        label="Select Lens Material and Frames"
      />
      <Stepper.Step
        icon={<IconEyeglass2 style={{ width: rem(18), height: rem(18) }} />}
        label="Visualize Glasses"
      />
    </Stepper>
  );
}