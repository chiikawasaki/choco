import {
  Drawer,
  Portal,
  CloseButton,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import { AlignJustify, Search, SlidersHorizontal } from "lucide-react";
const Searchbar = () => {
  return (
    <InputGroup
      endElement={
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <Search />
          <SlidersHorizontal />
        </div>
      }
    >
      <Input
        placeholder="キーワードを入力"
        size="sm"
        color="white"
        css={{
          borderRadius: "30px",
        }}
      />
    </InputGroup>
  );
};
export default Searchbar;
