import React from "react";
import { BottomSheet } from "../ui/BottomSheet";
import SupportHub from "../support/SupportHub";

export function SupportSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Help & Support">
      <div className="pb-8">
        <SupportHub />
      </div>
    </BottomSheet>
  );
}
