import React, { useEffect, useState } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
  errors?: string[];
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  errors,
}) => {
  const [strength, setStrength] = useState<{
    score: number;
    label: string;
    color: string;
    requirements: {
      met: boolean;
      message: string;
    }[];
  }>({
    score: 0,
    label: "Weak",
    color: "red-500",
    requirements: [
      { met: false, message: "8+ characters" },
      { met: false, message: "uppercase letter" },
      { met: false, message: "lowercase letter" },
      { met: false, message: "number" },
      { met: false, message: "special character" },
    ],
  });

  useEffect(() => {
    const requirements = [
      { met: password.length >= 8, message: "8+ characters" },
      { met: /[A-Z]/.test(password), message: "uppercase letter" },
      { met: /[a-z]/.test(password), message: "lowercase letter" },
      { met: /[0-9]/.test(password), message: "number" },
      { met: /[^A-Za-z0-9]/.test(password), message: "special character" },
    ];

    const score = requirements.filter((r) => r.met).length;
    let label, color;

    if (score === 5) {
      label = "Perfect";
      color = "green-500";
    } else if (score >= 3) {
      label = "Good";
      color = "yellow-500";
    } else {
      (label = "Weak"), (color = "red-500");
    }

    setStrength({
      score,
      label,
      color,
      requirements,
    });
  }, [password]);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1">
        {strength.requirements.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full flex-1 ${
              i < strength.score ? `bg-${strength.color}` : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-medium">
          Strength:{" "}
          <span className={`text-${strength.color}`}>{strength.label}</span>
        </span>
        {strength.score < 5 && (
          <span className="text-xs text-muted-foreground">
            {5 - strength.score} more requirement{strength.score < 4 ? "s" : ""}
          </span>
        )}
      </div>

      {((errors?.length ?? 0) > 0 ||
        (password.length > 0 && strength.score < 5)) && (
        <ul className="text-xs space-y-1 mt-2">
          {errors?.map((error, i) => (
            <li
              key={`error-${i}`}
              className="text-destructive flex items-center gap-2">
              <span>•</span>
              <span>{error}</span>
            </li>
          ))}

          {password.length > 0 &&
            strength.requirements.map(
              (req, i) =>
                !req.met && (
                  <li
                    key={`req-${i}`}
                    className="text-muted-foreground flex items-center gap-2">
                    <span>•</span>
                    <span>Needs {req.message}</span>
                  </li>
                )
            )}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
