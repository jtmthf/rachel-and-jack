import { MessageForm } from '@/components/message-form';
import { MessageList } from '@/components/message-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getVercelOidcToken } from '@vercel/functions/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER!;
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL!;
const GCP_WORKLOAD_IDENTITY_POOL_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_ID!;
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID!;

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const authClient = ExternalAccountClient.fromJSON({
  type: 'external_account',
  audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
  token_url: 'https://sts.googleapis.com/v1/token',
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    getSubjectToken: getVercelOidcToken,
  },
  scopes: SCOPES,
})!;

const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, authClient);

interface Message {
  id: number;
  text: string;
}

export default async function MessageBoard() {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const messages: Message[] = rows.map((row) => ({
    id: row.get('messages'),
    text: row.get('messages'),
  }));

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Message Board</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList messages={messages} />
          <div className="mt-4">
            <MessageForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
