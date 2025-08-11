import { Button } from "@chakra-ui/react";
import { Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Plus } from "lucide-react";
import { AlignJustify } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Home() {
  return (
    <div>
      <AlignJustify
        size={25}
        style={{ position: "absolute", top: "6px", left: "10px" }}
      />
      <Sidebar />
      <Button
        size="sm"
        variant="subtle"
        bg="#4338CA"
        color="white"
        css={{ borderRadius: "30px", margin: "100px", padding: "15px 25px" }}
      >
        保存する
      </Button>
      <InputGroup
        endElement={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Search />
            <SlidersHorizontal />
          </div>
        }
      >
        <Input
          placeholder="キーワードを入力"
          size="sm"
          color="white"
          css={{ borderRadius: "30px" }}
        />
      </InputGroup>
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
