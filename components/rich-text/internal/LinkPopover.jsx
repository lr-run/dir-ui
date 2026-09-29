import { useEditorText } from "./locale.js";
import React, { useId, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Toolbar } from "@base-ui/react/toolbar";
import { Input } from "@base-ui/react/input";
import { Button } from "../../icons/index.jsx";

export default function LinkPopover({ editor, disabled }) {
  const t = useEditorText();
  const [open, setOpen] = useState(false),
    [url, setUrl] = useState(""),
    [error, setError] = useState(false),
    selection = useRef(null),
    id = useId();
  function apply(remove = false) {
  const t = useEditorText();
    let c = editor.chain().focus().setTextSelection(selection.current);
    if (remove) {
      c.extendMarkRange("link").unsetLink().run();
      setOpen(false);
      return;
    }
    let href = url.trim();
    if (href && !/^[a-z][a-z\d+.-]*:/i.test(href)) href = "https://" + href;
    try {
      const u = new URL(href);
      if (
        !["https:", "http:", "mailto:"].includes(u.protocol) ||
        (u.protocol === "mailto:" && !u.pathname.includes("@"))
      )
        throw 0;
      href = u.href;
    } catch {
      setError(true);
      return;
    }
    if (
      selection.current.from === selection.current.to &&
      !editor.isActive("link")
    )
      c.insertContent({
        type: "text",
        text: href,
        marks: [{ type: "link", attrs: { href } }],
      }).run();
    else c.extendMarkRange("link").setLink({ href }).run();
    setOpen(false);
  }
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          selection.current = {
            from: editor.state.selection.from,
            to: editor.state.selection.to,
          };
          setUrl(editor.getAttributes("link").href || "");
          setError(false);
        }
        setOpen(next);
      }}
    >
      <Popover.Trigger
        disabled={disabled || !editor}
        render={
          <Toolbar.Button
            aria-label={t("Add or edit link")}
            disabled={disabled}
            aria-pressed={!!editor?.isActive("link")}
            onMouseDown={(e) => e.preventDefault()}
          />
        }
      >
        <svg className="[svg&]:block [svg&]:w-[16px] [svg&]:h-[16px] [svg&]:[fill:none] [svg&]:[stroke:currentColor] [svg&]:[stroke-width:1.5] [svg&]:[stroke-linecap:round] [svg&]:[stroke-linejoin:round] [svg&]:shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m10 13 4-4m-5 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" />
        </svg>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="[outline:0] z-2147483140"
          sideOffset={8}
          collisionPadding={12}
        >
          <Popover.Popup
            className="[border:1px_solid_var(--ui-border)] rounded-[9px] [box-shadow:var(--ui-shadow)] [outline:0] [transform-origin:var(--transform-origin)] [transition:opacity_120ms,_transform_120ms] [@media(prefers-reduced-motion:_reduce)]:[transition:none] box-border [font:inherit] text-inherit [&_input]:box-border [&_input]:[font:inherit] [&_input]:text-inherit [&_button]:box-border [&_button]:[font:inherit] [&_button]:text-inherit [&_button]:cursor-pointer [&_button]:[touch-action:manipulation] [&_button]:[border:0] [&_button]:[background:none] [background:var(--ui-raised)] [&[data-starting-style]]:opacity-0 [&[data-starting-style]]:[transform:translateY(-3px)] [&[data-ending-style]]:opacity-0 [&[data-ending-style]]:[transform:translateY(-3px)] [&_button:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&_button:focus-visible]:outline-offset-[2px] grid gap-[9px] p-[14px] w-[350px] max-w-[calc(100vw_-_24px)] [&_h2]:text-[0.75rem] [&_h2]:font-medium [&_h2]:m-0 [&_input]:[border:1px_solid_var(--ui-control-border)] [&_input]:rounded-[6px] [&_input]:[background:var(--ui-surface)] [&_input]:p-[8px_9px] [&_input]:w-full [&_input]:min-w-0 [@media(max-width:_680px)]:[&_input]:text-[1rem]"
            initialFocus
            finalFocus={() => editor?.view.dom}
          >
            <Popover.Title>{t("Link URL")}</Popover.Title>
            <Popover.Description className="[clip-path:inset(50%)] absolute w-[1px] h-[1px] p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap [border:0]">
              {t("Apply a web or email link to your selection.")}
            </Popover.Description>
            <Input
              aria-label={t("Link URL")}
              value={url}
              onValueChange={setUrl}
              placeholder="https://example.com"
              aria-invalid={error}
              aria-describedby={error ? id : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
            />
            {error && (
              <p id={id} className="text-[0.6875rem] text-destructive m-0" role="alert">
                {t("Enter a valid web or email link.")}
              </p>
            )}
            <div className="flex gap-[6px] items-center [&>span]:flex-1">
              {editor?.isActive("link") && (
                <Button className="box-border [font:inherit] text-inherit cursor-pointer [touch-action:manipulation] h-[32px] inline-flex items-center justify-center gap-[6px] p-[0_11px] text-[0.75rem] font-medium [border:1px_solid_var(--ui-border)] rounded-[8px] [background:linear-gradient(180deg,_var(--ui-subtle),_var(--ui-surface))] [box-shadow:0_1px_2px_rgb(0_0_0/0.03)] whitespace-nowrap [@media(pointer:_coarse)]:min-h-[44px] [@media(pointer:_coarse)]:h-auto [@media(pointer:_coarse)]:[padding-block:8px] [&:hover]:[background:var(--ui-hover)] [&[class~='group/primary']]:[background:linear-gradient(180deg,_var(--ui-primary-top),_var(--ui-primary))] [&[class~='group/primary']]:text-[var(--ui-on-primary)] [&[class~='group/primary']]:[border:1px_solid_var(--ui-primary)] [&:disabled]:opacity-50 [&:disabled]:cursor-default [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[2px] [&[class~='group/primary']:hover]:[background:var(--ui-primary-hover)]" onClick={() => apply(true)}>
                  {t("Remove link")}
                </Button>
              )}
              <span />
              <Popover.Close className="box-border [font:inherit] text-inherit cursor-pointer [touch-action:manipulation] h-[32px] inline-flex items-center justify-center gap-[6px] p-[0_11px] text-[0.75rem] font-medium [border:1px_solid_var(--ui-border)] rounded-[8px] [background:linear-gradient(180deg,_var(--ui-subtle),_var(--ui-surface))] [box-shadow:0_1px_2px_rgb(0_0_0/0.03)] whitespace-nowrap [@media(pointer:_coarse)]:min-h-[44px] [@media(pointer:_coarse)]:h-auto [@media(pointer:_coarse)]:[padding-block:8px] [&:hover]:[background:var(--ui-hover)] [&[class~='group/primary']]:[background:linear-gradient(180deg,_var(--ui-primary-top),_var(--ui-primary))] [&[class~='group/primary']]:text-[var(--ui-on-primary)] [&[class~='group/primary']]:[border:1px_solid_var(--ui-primary)] [&:disabled]:opacity-50 [&:disabled]:cursor-default [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[2px] [&[class~='group/primary']:hover]:[background:var(--ui-primary-hover)]">{t("Cancel")}</Popover.Close>
              <Button className="box-border [font:inherit] text-inherit cursor-pointer [touch-action:manipulation] h-[32px] inline-flex items-center justify-center gap-[6px] p-[0_11px] text-[0.75rem] font-medium [border:1px_solid_var(--ui-border)] rounded-[8px] [background:linear-gradient(180deg,_var(--ui-subtle),_var(--ui-surface))] [box-shadow:0_1px_2px_rgb(0_0_0/0.03)] whitespace-nowrap [@media(pointer:_coarse)]:min-h-[44px] [@media(pointer:_coarse)]:h-auto [@media(pointer:_coarse)]:[padding-block:8px] [&:hover]:[background:var(--ui-hover)] [&[class~='group/primary']]:[background:linear-gradient(180deg,_var(--ui-primary-top),_var(--ui-primary))] [&[class~='group/primary']]:text-[var(--ui-on-primary)] [&[class~='group/primary']]:[border:1px_solid_var(--ui-primary)] [&:disabled]:opacity-50 [&:disabled]:cursor-default [&:focus-visible]:[outline:2px_solid_var(--ui-focus)] [&:focus-visible]:outline-offset-[2px] [&[class~='group/primary']:hover]:[background:var(--ui-primary-hover)] group/primary" onClick={() => apply()}>
                {t("Apply")}
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
