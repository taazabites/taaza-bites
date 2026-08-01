import React, { useEffect, useState } from "react";
import { communicationService } from "../../services/communication";
import { MessageTemplate } from "../../types/communication";

export default function Templates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  useEffect(() => {
    const unsub = communicationService.subscribeToTemplates((data) => {
      setTemplates(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Message Templates</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <ul>
          {templates.map(t => <li key={t.id}>{t.name}</li>)}
        </ul>
      </div>
    </div>
  );
}
