import { Box, Input, InputGroup } from "@chakra-ui/react";
import { Search, SlidersHorizontal } from "lucide-react";

interface SearchbarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  width?: string;
}

const Searchbar = ({
  value = "",
  onChange,
  placeholder = "キーワードを入力",
  width = "300px",
}: SearchbarProps) => {
  return (
    <Box w={width}>
      <InputGroup
        endElement={
          <Box display="flex" gap="0.5rem" color="#8B6F47">
            <Search />
            <SlidersHorizontal />
          </Box>
        }
      >
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          size="sm"
          color="#8B6F47"
          bg="#fefdf9"
          border="2px solid"
          borderColor="#A67B5B"
          _placeholder={{
            color: "#A67B5B",
          }}
          _hover={{
            borderColor: "#A67B5B",
            shadow: "sm",
          }}
          _focus={{
            borderColor: "#8B6F47",
            bg: "white",
            shadow: "md",
          }}
          transition="all 0.2s"
          css={{
            borderRadius: "30px",
          }}
        />
      </InputGroup>
    </Box>
  );
};
export default Searchbar;
