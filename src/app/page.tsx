import { Button } from "@chakra-ui/react";
import { Bold, Plus } from "lucide-react";
import { AlignJustify } from "lucide-react";
import { PiFileXDuotone, PiX } from "react-icons/pi";

export default function Home() {
  return (
    <div>
      <AlignJustify
        size={25}
        style={{ position: "absolute", top: "6px", left: "10px" }}
      />
      <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "10px", padding: "15px 25px" }}
      >
        保存する
      </Button>
      <Button
        bg="#4338CA"
        css={{
          position: "fixed",
          bottom: "5%",
          right: "2%",
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
