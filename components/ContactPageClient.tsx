"use client";

import { useRef, useState } from "react";
import { HubSpotContact } from "@/types/hubspot";
import {
  IconDeviceMobile,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useBrand } from "@/context/BrandContext";
import { useContactContext } from "@/context/ContactContext";
import { MeetingLogList } from "@/components/MeetingLogList";
import { StatusBadgeContactDetails } from "@/components/StatusBadgeContactDetails";
import { EditContactModal } from "@/components/EditContactModal";
import { UpdateStatusModal } from "@/components/UpdateStatusModal";

function getPastelColors(company?: string) {
  if (!company) return { bg: "rgb(203,213,225)", text: "rgb(100,116,139)" };
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  const baseR = 200 + (hash % 56);
  const baseG = 200 + ((hash >> 8) % 56);
  const baseB = 200 + ((hash >> 16) % 56);
  return {
    bg: `rgb(${baseR}, ${baseG}, ${baseB})`,
    text: `rgb(${Math.max(0, baseR - 40)}, ${Math.max(0, baseG - 40)}, ${Math.max(0, baseB - 40)})`,
  };
}

export default function ContactPageClient({ contact }: { contact: HubSpotContact }) {
  const { brand } = useBrand();
  const {
    setSelectedContact,
    setEditOpen,
    setLogOpen,
    setContactId,
    setLogContactData,
  } = useContactContext();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const logListRef = useRef<{ refetch: () => void }>(null);

  const { bg, text } = getPastelColors(contact?.properties?.company);
  const getInitials = (company?: string) => {
    if (!company) return "--";
    const [first = "", second = ""] = company.trim().split(" ");
    return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen h-full relative">
      <div className="flex flex-col md:flex-row rounded-md gap-8 p-6 border border-muted bg-muted/50 dark:bg-muted/50">
        <div
          className="hidden h-36 w-36 rounded-full md:flex m-auto items-center justify-center text-4xl md:text-[48px] font-bold uppercase transition-all duration-300 ease-in-out"
          style={{ backgroundColor: bg, color: text }}
        >
          {getInitials(contact?.properties?.company)}
        </div>

        <div className="flex-1">
          <h3 className="dark:text-white font-bold text-2xl uppercase">
            {contact?.properties.company}
          </h3>

          <div className="mt-1 flex items-center gap-2">
            <StatusBadgeContactDetails
              status={contact.properties.l2_lead_status || "unknown"}
            />
            <IconPencil
              className="text-gray-400 cursor-pointer"
              onClick={() => setShowStatusModal(true)}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 dark:text-gray-300">
            <IconMail size={18} />
            {contact.properties?.email || "N/A"}
          </div>

          <div className="flex items-center gap-2 dark:text-gray-300 my-1">
            <IconDeviceMobile size={18} />
            {contact.properties?.phone || "N/A"}
          </div>

          <div className="flex gap-2 dark:text-gray-300">
            <IconMapPin size={18} />
            <div className="w-full">
              {contact.properties?.address || "N/A"} {contact.properties?.city || "N/A"},{" "}
              {contact.properties?.state || "N/A"} {contact.properties?.zip || "N/A"}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                setSelectedContact(contact);
                setEditOpen(true);
              }}
              className="cursor-pointer text-sm mt-6 px-4 py-2 border border-black hover:bg-black hover:text-white dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-black rounded transition duration-200 flex items-center gap-1"
            >
              <IconPencil size={18} /> Edit Contact
            </button>

            <button
              onClick={() => {
                setContactId(contact.id);
                setLogContactData(contact);
                setLogOpen(true);
              }}
              className={clsx(
                "group cursor-pointer text-sm mt-6 px-4 py-2 border rounded transition duration-200 flex items-center gap-1",
                brand === "skwezed"
                  ? "border-[#009444] bg-[#009444] text-white"
                  : "border-green-400 bg-green-400 text-black dark:text-green-400 dark:bg-transparent dark:hover:bg-green-400 dark:hover:text-black"
              )}
            >
              <span className="transition-transform duration-500 transform group-hover:rotate-[180deg]">
                <IconPlus size={18} />
              </span>
              Log Meeting
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 my-6">
        <hr className="flex-grow border-t border-gray-200 dark:border-zinc-800" />
        <div className="text-lg font-semibold whitespace-nowrap">Meeting Logs</div>
        <hr className="flex-grow border-t border-gray-200 dark:border-zinc-800" />
      </div>

      <MeetingLogList ref={logListRef} contactId={contact.id} />

      <EditContactModal showDetails={false} />
      <UpdateStatusModal
        open={showStatusModal}
        setOpen={setShowStatusModal}
        currentStatus={contact.properties.l2_lead_status || "pending visit"}
        contactId={contact.id}
        contact={contact}
      />
    </div>
  );
}
