import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <div>
      <Button
        bg="#4338CA"
        css={{
          width: "70px",
          height: "70px",
          borderRadius: "50%",
        }}
      >
        <Plus color="white" />
      </Button>
    </div>
  );
}
