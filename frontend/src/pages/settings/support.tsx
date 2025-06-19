import { type FunctionComponent } from "react";
import { Github, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import Constants from "../../constants";
import { openInBrowser } from "../../lib/utils";

const SupportPage: FunctionComponent<{}> = () => {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Support</h1>
      <p className="mb-8 text-lg text-gray-700">
        We are more than happy to help you.
      </p>

      <div className="space-y-8">
        {/* Questions/Ideas Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <MessageCircle className="mr-2 h-5 w-5 text-blue-600" />
            Have questions/ideas or need help?
          </h4>
          <p className="mb-4 text-gray-700">
            If you have any questions or ideas, please join our Discord server
            and share. We are open to discussing anything your questions or
            ideas.
          </p>
          <Button
            onClick={() => {
              openInBrowser(Constants.EXTERNAL_PATHS.DISCORD_COMMUNITY);
            }}
            className="inline-flex items-center"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Join Discord Community
          </Button>
        </div>

        {/* Bugs/Errors Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <Github className="mr-2 h-5 w-5 text-gray-600" />
            Facing bugs or errors?
          </h4>
          <p className="mb-4 text-gray-700">
            If you are getting any errors or bugs, join our Discord server and
            ask for help. We will try to fix the errors bugs in the next version
            release.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              openInBrowser(Constants.EXTERNAL_PATHS.REPORT_BUGS);
            }}
            className="inline-flex items-center"
          >
            <Github className="mr-2 h-4 w-4" />
            File a Github Issue
          </Button>
        </div>

        {/* What's New Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
            <ExternalLink className="mr-2 h-5 w-5 text-green-600" />
            Want to check what's new?
          </h4>
          <p className="mb-4 text-gray-700">
            Visit our website to check new releases.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              openInBrowser(Constants.EXTERNAL_PATHS.OFFICIAL_WEBSITE);
            }}
            className="inline-flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit Slashbase.com
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
