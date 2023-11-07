import { Group, SegmentedControl } from "@mantine/core";
import React from "react";

export type Model = "gpt-3.5-turbo" | "gpt-4-1106-preview";

export function ModelChooser(props: {
  value: string;
  onChange: (model: Model) => Promise<void>;
}) {
  return (
    <Group position="center" my={40}>
      <SegmentedControl
        value={props.value}
        fullWidth
        size="md"
        sx={(theme) => ({
          [`@media (min-width: ${theme.breakpoints.md})`]: {
            width: "30%",
          },
        })}
        data={[
          { label: "GPT-3.5", value: "gpt-3.5-turbo" },
          { label: "GPT-4", value: "gpt-4-1106-preview" },
        ]}
        onChange={props.onChange}
      />
    </Group>
  );
}
