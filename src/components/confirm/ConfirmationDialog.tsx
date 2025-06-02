import React from "react";

import { DialogTitle } from "@radix-ui/react-dialog";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import { IConfirmOption } from "./ConfirmProvider";

interface IConfirmationDialogProps {
  open: boolean;
  options: IConfirmOption;
  onCancel: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationDialog = ({ open, options, onCancel, onConfirm, onClose }: IConfirmationDialogProps) => {
  const {
    title,
    description,
    content,
    confirmationText,
    cancellationText,
    dialogProps,
    dialogActionsProps,
    confirmationButtonProps,
    cancellationButtonProps,
    titleProps,
    contentProps,
    confirmationKeyword,
    confirmationKeywordTextFieldProps,
    hideCancelButton,
    buttonOrder,
    acknowledgement,
    acknowledgementCheckboxProps,
  } = options;

  const [confirmationKeywordValue, setConfirmationKeywordValue] = React.useState("");
  const [isAcknowledged, setIsAcknowledged] = React.useState(false);

  const confirmationButtonDisabled = Boolean((confirmationKeyword && confirmationKeywordValue !== confirmationKeyword) || (acknowledgement && !isAcknowledged));

  const acknowledgeCheckbox = (
    <>
      {acknowledgement && (
        <div className="flex items-center space-x-2">
          <Checkbox {...acknowledgementCheckboxProps} checked={isAcknowledged} onCheckedChange={(v) => setIsAcknowledged(v === true)} />
          <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {acknowledgement}
          </label>
        </div>
      )}
    </>
  );

  const confirmationContent = (
    <>
      {confirmationKeyword && (
        <Input onChange={(e) => setConfirmationKeywordValue(e.target.value)} value={confirmationKeywordValue} {...confirmationKeywordTextFieldProps} />
      )}
    </>
  );

  const dialogActions = buttonOrder.map((buttonType) => {
    if (buttonType === "cancel") {
      return (
        !hideCancelButton && (
          <Button type="button" key="cancel" {...cancellationButtonProps} onClick={onCancel} variant="danger" className="w-[80px]">
            {cancellationText}
          </Button>
        )
      );
    }

    if (buttonType === "confirm") {
      return (
        <Button
          type="button"
          key="confirm"
          variant="default"
          disabled={confirmationButtonDisabled}
          {...confirmationButtonProps}
          onClick={onConfirm}
          className="w-[80px]"
        >
          {confirmationText}
        </Button>
      );
    }

    throw new Error(`Supported button types are only "confirm" and "cancel", got: ${buttonType}`);
  });

  return (
    <Dialog
      {...dialogProps}
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      // Focus management handled in DialogContent
    >
      <DialogContent>
        <DialogHeader>
          {title && (
            <DialogTitle {...titleProps} className="font-bold">
              {title}
            </DialogTitle>
          )}{" "}
        </DialogHeader>
        {content ? (
          <div {...contentProps} className="p-4">
            {content}
            {confirmationContent}
            {acknowledgeCheckbox}
          </div>
        ) : description ? (
          <div {...contentProps} className="p-3">
            {typeof description === "string" ? <div className="text-base leading-6">{description}</div> : description}
            {confirmationContent}
            {acknowledgeCheckbox}
          </div>
        ) : (
          (confirmationKeyword || acknowledgeCheckbox) && (
            <div {...contentProps} className="p-4">
              {confirmationContent}
              {acknowledgeCheckbox}
            </div>
          )
        )}
        <DialogFooter {...dialogActionsProps}>
          <div className="flex w-full items-center justify-between">{dialogActions}</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
