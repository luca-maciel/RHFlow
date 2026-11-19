import { useEffect, useState } from "react";
import employeeService from "../../services/employeeService";

type EmployeeAvatarProps = {
  employeeId: string;
  name: string;
  hasPhoto: boolean;
  refreshKey?: number;
  className?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts.at(-1)![0]).toUpperCase();
}

export default function EmployeeAvatar({
  employeeId,
  name,
  hasPhoto,
  refreshKey = 0,
  className = "h-10 w-10 rounded-full text-[11px]",
}: EmployeeAvatarProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!hasPhoto) {
      setPhotoUrl(null);
      return;
    }

    employeeService
      .fetchPhotoUrl(employeeId)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setPhotoUrl(url);
      })
      .catch(() => {
        if (active) setPhotoUrl(null);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [employeeId, hasPhoto, refreshKey]);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`Foto de ${name}`}
        className={`shrink-0 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-icon-surface font-bold text-primary ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}