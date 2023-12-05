import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { products, Product} from "../mockData/products";
import {Stock, stocks} from "../mockData/stocks";


const dynamoDBClient = new DynamoDBClient({ region: "eu-west-1",});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

async function addProduct(tableName: string, products: Product[]): Promise<void> {
    for (const product of products) {
        const productPattern = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
        };
        console.log(productPattern)
        const addProduct = new PutCommand({ TableName: tableName, Item: productPattern });
        await documentClient.send(addProduct);
    }
}

async function addStock(tableName: string, stocks: Stock[]): Promise<void> {
    for (const stock of stocks) {
        const stockPattern = {
            'product_id': stock.product_id,
            'count': stock.count,
        };
        const addStock = new PutCommand({ TableName: tableName, Item: stockPattern });
        await documentClient.send(addStock);
    }
}

(async () => {
    await addProduct('Products', products);
    await addStock('Stocks', stocks);
})();
