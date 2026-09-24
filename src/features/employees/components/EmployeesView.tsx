"use client";

import { useState } from "react";

import { EmployeeForm } from "./EmployeeForm";
import { FaceEnrollmentCard } from "./FaceEnrollmentCard";
import { RecentEmployeesCard } from "./RecentEmployeesCard";

export function EmployeesView() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // Bumped on every successful save to remount FaceEnrollmentCard, which
  // clears its own preview/object-URL state (it isn't a controlled input).
  const [resetKey, setResetKey] = useState(0);

  const handleSaved = () => {
    setPhotoFile(null);
    setResetKey((key) => key + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      <EmployeeForm photoFile={photoFile} onSaved={handleSaved} />
      <div
        style={{
          flex: "1 1 280px",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <FaceEnrollmentCard key={resetKey} onFileChange={setPhotoFile} />
        {/* <RecentEmployeesCard /> */}
      </div>
    </div>
  );
}
