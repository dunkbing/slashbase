import { type FunctionComponent, useEffect } from "react";
import { Package } from "lucide-react";
import logo from "../../assets/images/logo-icon.svg";
import { useApp } from "../../hooks/useApp";

const AboutPage: FunctionComponent<{}> = () => {
  const { selectAPIVersion, healthCheck } = useApp();

  const version = selectAPIVersion;

  useEffect(() => {
    healthCheck();
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">About Slashbase</h1>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center space-x-4">
          <img
            src={logo}
            width={44}
            height={50}
            alt="Slashbase Logo"
            className="flex-shrink-0"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Slashbase</h2>
            <p className="text-gray-600">Modern Database IDE</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="mb-4 flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Version</span>
          </div>
          <p className="rounded border bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700">
            {version || "Loading..."}
          </p>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-500">
        <p>Licensed under the Apache License 2.0</p>
        <p>Copyright © 2021-2023 Slashbase.com</p>
      </div>
    </div>
  );
};

export default AboutPage;
