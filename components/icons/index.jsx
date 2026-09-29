import React from "react";
import { Button } from "@base-ui/react/button";
import { Select } from "@base-ui/react/select";
import { Checkbox } from "@base-ui/react/checkbox";
import { Tooltip } from "@base-ui/react/tooltip";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { Toast } from "@base-ui/react/toast";
import { icon } from "./icons.js";

export { Button };
export const I = ({ name }) => (
  <span className="group/svg-wrap contents [[data-slot='button']_&]:w-[15px] [[data-slot='button']_&]:h-[15px] [[data-slot='button']_&]:shrink-0" dangerouslySetInnerHTML={{ __html: icon(name) }} />
);
export const Graphic = ({ html }) => (
  <span className="group/svg-wrap contents [[data-slot='button']_&]:w-[15px] [[data-slot='button']_&]:h-[15px] [[data-slot='button']_&]:shrink-0" dangerouslySetInnerHTML={{ __html: html }} />
);
export function Hint({ label, children }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={7} className="pointer-events-none z-2147483150">
          <Tooltip.Popup className="max-w-[220px] p-[5px_8px] [background:var(--ui-text)] text-[var(--ui-canvas)] rounded-[5px] text-[0.6875rem] [box-shadow:var(--ui-shadow)]">{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
export function Choice({
  id,
  label,
  value,
  onChange,
  items,
  prefix,
  className = "",
  disabled = false,
}) {
  const options = items.map((i) =>
    typeof i === "string" ? { label: i, value: i } : i,
  );
  return (
    <Select.Root
      value={value}
      onValueChange={onChange}
      items={options}
      disabled={disabled}
    >
      <Select.Trigger
        id={id}
        aria-label={label}
        className={(prefix ? "[@media(max-width:_680px)]:text-[0.75rem] [&>[class~='group/select-value']]:text-foreground [&>[class~='group/select-value']]:max-w-[135px] [&>[class~='group/select-value']]:overflow-hidden [&>[class~='group/select-value']]:text-ellipsis [&>[class~='group/select-value']]:whitespace-nowrap [&:focus-visible]:outline-offset-[2px] [@media(max-width:_680px)]:[&>[class~='group/filter-prefix']]:hidden [@media(max-width:_680px)]:[&>[class~='group/select-value']]:inline [@media(max-width:_680px)]:[&>[class~='group/select-value']]:max-w-[108px] [@media(max-width:_680px)]:[&>[class~='group/select-icon']]:inline-flex" : "group/select-control flex items-center gap-[8px] text-left w-full min-w-0 [border:1px_solid_var(--ui-control-border)] rounded-[6px] p-[8px_9px] min-h-[36px] text-[0.875rem] [background:var(--ui-surface)] [@media(max-width:_680px)]:text-[1rem] [@media(max-width:_680px)]:min-h-[42px] [@media(pointer:_coarse)]:min-h-[44px] box-border [font:inherit] text-inherit cursor-pointer [touch-action:manipulation] [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[2px]") + "  " + className}
      >
        {prefix && <span className="group/filter-prefix whitespace-nowrap">{prefix}</span>}
        <Select.Value className="group/select-value overflow-hidden text-ellipsis whitespace-nowrap" />
        <Select.Icon className="group/select-icon inline-flex ml-auto shrink-0 [&_svg]:w-[11px] [&_svg]:h-[11px]">
          <I name="chevron" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="[outline:0] z-2147483140"
          sideOffset={6}
          align="start"
          alignItemWithTrigger={false}
          collisionPadding={8}
        >
          <Select.Popup className="[border:1px_solid_var(--ui-border)] rounded-[9px] [box-shadow:var(--ui-shadow)] p-[5px] [outline:0] [transform-origin:var(--transform-origin)] [transition:opacity_120ms,_transform_120ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] box-border [font:inherit] text-inherit [&_input]:box-border [&_input]:[font:inherit] [&_input]:text-inherit [&_button]:box-border [&_button]:[font:inherit] [&_button]:text-inherit [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] [background:var(--ui-raised)] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(-3px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(-3px)] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px] min-w-[var(--anchor-width)] max-w-[calc(100vw_-_24px)] max-h-[var(--available-height)] overflow-auto [scrollbar-width:thin]">
            <Select.List>
              {options.map((i) => (
                <Select.Item
                  key={i.value}
                  value={i.value}
                  className="flex items-center justify-between gap-[20px] p-[7px_8px] rounded-[5px] text-[0.75rem] cursor-default [outline:0] whitespace-nowrap min-h-[30px] [&_svg]:w-[13px] [&_svg]:h-[13px] [@media(pointer:_coarse)]:min-h-[44px] [&[data-highlighted]]:[background:var(--ui-hover)] [&[data-highlighted]]:text-foreground [&[data-selected]]:text-[var(--ui-violet)]"
                >
                  <Select.ItemText>{i.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <I name="check" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
export function Check({ label, ...props }) {
  return (
    <span className="check-wrap">
      <Checkbox.Root className="grid [place-items:center] [border:1px_solid_var(--ui-control-border)] [background:var(--ui-canvas)] rounded-[3px] w-[13px] h-[13px] p-0 shrink-0 [&_svg]:w-[11px] [&_svg]:h-[11px] [&_svg]:[stroke-width:2] [@media(pointer:_coarse)]:w-[18px] [@media(pointer:_coarse)]:h-[18px] [@media(pointer:_coarse)]:[&_svg]:w-[14px] [@media(pointer:_coarse)]:[&_svg]:h-[14px] box-border [font:inherit] text-inherit cursor-pointer [touch-action:manipulation] [&[data-checked]]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)] [&[data-checked]]:text-[white] [&[data-indeterminate]]:[background:var(--ui-primary)] [&[data-indeterminate]]:[border-color:var(--ui-primary)] [&[data-indeterminate]]:text-[white] [&[data-indeterminate]_svg]:hidden [&:disabled]:opacity-50 [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[2px] [&[data-indeterminate]:after]:[content:''] [&[data-indeterminate]:after]:h-[1.5px] [&[data-indeterminate]:after]:w-[7px] [&[data-indeterminate]:after]:[background:white]" aria-label={label} {...props}>
        <Checkbox.Indicator>
          <I name="check" />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </span>
  );
}
export function Theme({ value, onChange }) {
  return (
    <ToggleGroup
      className="[@media(min-width:_681px)_and_(max-width:_899px)]:flex-col flex gap-[2px] [background:var(--ui-subtle)] p-[3px] rounded-[7px] [&_button]:w-[28px] [&_button]:h-[26px] [&_button]:grid [&_button]:[place-items:center] [&_button]:text-muted-foreground [&_button]:rounded-[5px] [@media(max-width:1100px)]:[&_button]:w-[23px] [&_button[data-pressed]]:[background:var(--ui-raised)] [&_button[data-pressed]]:[box-shadow:0_1px_3px_var(--ui-shadow-color)] [&_button[data-pressed]]:text-foreground"
      aria-label="Appearance"
      value={[value]}
      onValueChange={(v) => v.length && onChange(v[0])}
    >
      {[
        ["light", "sun"],
        ["dark", "moon"],
        ["system", "monitor"],
      ].map(([v, i]) => (
        <Hint key={v} label={v[0].toUpperCase() + v.slice(1) + " theme"}>
          <Toggle
            value={v}
            aria-label={v[0].toUpperCase() + v.slice(1) + " theme"}
          >
            <I name={i} />
          </Toggle>
        </Hint>
      ))}
    </ToggleGroup>
  );
}
export function Toasts() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed bottom-[50px] right-[20px] w-[380px] max-w-[calc(100vw_-_32px)] flex flex-col gap-[8px] [outline:0] [@media(max-width:_680px)]:right-[16px] z-2147483160">
        {toasts.map((t) => (
          <Toast.Root key={t.id} toast={t} className="flex items-center gap-[9px] [background:var(--ui-raised)] text-foreground [border:1px_solid_var(--ui-border)] [box-shadow:var(--ui-shadow)] rounded-[9px] p-[11px_12px] text-[0.75rem] [transition:opacity_140ms,_transform_140ms] [&>svg]:text-[var(--ui-green)] [&_h2]:[font-size:inherit] [&_h2]:font-normal [&_h2]:m-0 [&_p]:m-0 [@media(prefers-reduced-motion:_reduce)]:[transition:none] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(8px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(8px)] [&[data-limited]]:hidden">
            <I name="check" />
            <Toast.Content>
              <Toast.Title>{t.title}</Toast.Title>
              <Toast.Description>{t.description}</Toast.Description>
            </Toast.Content>
            {t.actionProps && (
              <Toast.Action className="text-[var(--ui-violet)] text-[0.6875rem] p-[2px_5px] ml-auto whitespace-nowrap">
                {t.actionProps.children}
              </Toast.Action>
            )}
            <Toast.Close
              aria-label="Dismiss notification"
              className="ml-auto w-[24px] h-[24px] grid [place-items:center] text-muted-foreground [&_svg]:w-[12px] [&_svg]:h-[12px]"
            >
              <I name="x" />
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
