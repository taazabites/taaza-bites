import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Help() {
  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-black">Help</h1>
      <p className="text-sm text-muted-foreground">
        Report a stop-specific problem from the delivery screen so operations gets the order id.
      </p>
      <Button asChild className="w-full h-14">
        <Link to="/deliveries">Open queue / report problem</Link>
      </Button>
      <Button variant="outline" className="w-full h-14" onClick={() => window.open("tel:+918000000001")}>
        <Phone className="size-4 mr-2" /> Call dispatch
      </Button>
    </div>
  );
}
