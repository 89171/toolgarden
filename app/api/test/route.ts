export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    success: true,
    message: 'API test successful',
  });
}
