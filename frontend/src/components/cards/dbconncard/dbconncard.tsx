import { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { Link } from "react-router-dom";
import { Database, MoreVertical, Trash2 } from "lucide-react";
import Constants from "../../../constants";
import type { DBConnection } from "../../../data/models";
import { Button } from "../../ui/button";

type DBConnCardPropType = {
  dbConn: DBConnection;
  onDeleteDB: (dbConnId: string) => void;
};

const DBConnCard = ({ dbConn, onDeleteDB }: DBConnCardPropType) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="my-4 max-w-[600px] rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={Constants.APP_PATHS.DB.path.replace("[id]", dbConn.id)}
        className="block text-inherit no-underline"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center font-semibold text-gray-900">
            <Database className="mr-2 h-4 w-4" />
            {dbConn.name}
          </div>
          <div
            className="relative"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDropdown}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showDropdown && (
              <OutsideClickHandler
                onOutsideClick={() => {
                  setShowDropdown(false);
                }}
              >
                <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border border-gray-200 bg-white shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onDeleteDB(dbConn.id);
                      }}
                      className="flex w-full items-center px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete DB
                    </button>
                  </div>
                </div>
              </OutsideClickHandler>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DBConnCard;
