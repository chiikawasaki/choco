import { Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";
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
        color="black"
        css={{
          borderRadius: "30px",
        }}
      />
    </InputGroup>
  );
};
export default Searchbar;
